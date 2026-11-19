package tech.aiinterviews.core.resume;

import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.common.PDStream;
import org.apache.pdfbox.pdmodel.graphics.form.PDFormXObject;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.IntStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;

class ResumeTextExtractorTest {

	private static final String CYRILLIC = "Опыт работы: Java, Spring";

	private final ResumeTextExtractor extractor = new ResumeTextExtractor();

	@Test
	void extractsPdf() throws IOException {
		assertThat(extractor.extract(pdf(List.of("Java Developer", "Spring Boot")))).contains("Java Developer", "Spring Boot");
	}

	@Test
	void readsOnlyFirstTwentyPdfPages() throws IOException {
		List<String> pages = IntStream.rangeClosed(1, 25).mapToObj(i -> "page" + i + "end").toList();

		String text = extractor.extract(pdf(pages));

		assertThat(text).contains("page20end").doesNotContain("page21end");
	}

	@Test
	void rejectsPdfWithTooMuchText() throws IOException {
		String line = "x".repeat(90);
		List<String> pages = IntStream.range(0, 15).mapToObj(i -> line).toList();
		byte[] bytes = pdf(pages, 100);

		assertThat(status(() -> extractor.extract(bytes))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
	}

	@Test
	void stopsEarlyOnPageWithHugeText() throws IOException {
		byte[] bytes = pdf(List.of("x".repeat(80)), 20_000);

		assertTimeoutPreemptively(Duration.ofSeconds(5), () ->
				assertThat(status(() -> extractor.extract(bytes))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT));
	}

	@Test
	void rejectsPageWithHugeContentStream() throws IOException {
		byte[] bytes;
		try (PDDocument document = new PDDocument()) {
			PDPage page = new PDPage();
			document.addPage(page);
			page.setContents(new PDStream(document, new ByteArrayInputStream(spaces(20 * 1024 * 1024)),
					COSName.FLATE_DECODE));
			bytes = save(document);
		}

		assertTimeoutPreemptively(Duration.ofSeconds(5), () ->
				assertThat(status(() -> extractor.extract(bytes))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT));
	}

	@Test
	void skipsPagesAfterLimitWithoutReadingThem() throws IOException {
		byte[] bytes;
		try (PDDocument document = new PDDocument()) {
			PDStream shared = new PDStream(document, new ByteArrayInputStream(spaces(2 * 1024 * 1024)), COSName.FLATE_DECODE);
			for (int i = 0; i < 2000; i++) {
				PDPage page = new PDPage();
				document.addPage(page);
				page.setContents(shared);
			}
			bytes = save(document);
		}

		assertTimeoutPreemptively(Duration.ofSeconds(5), () -> assertThat(extractor.extract(bytes)).isBlank());
	}

	@Test
	void stopsSlowPdfByTime() throws IOException {
		byte[] bytes;
		try (PDDocument document = new PDDocument()) {
			PDPage page = new PDPage();
			document.addPage(page);
			PDFormXObject form = new PDFormXObject(
					new PDStream(document, new ByteArrayInputStream(spaces(2 * 1024 * 1024)), COSName.FLATE_DECODE));
			form.setBBox(new PDRectangle(10, 10));
			try (PDPageContentStream content = new PDPageContentStream(document, page)) {
				for (int i = 0; i < 3000; i++) {
					content.drawForm(form);
				}
			}
			bytes = save(document);
		}

		assertTimeoutPreemptively(Duration.ofSeconds(10), () ->
				assertThat(status(() -> extractor.extract(bytes))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT));
	}

	@Test
	void returnsBlankForPdfWithoutText() throws IOException {
		assertThat(extractor.extract(pdf(List.of("")))).isBlank();
	}

	@Test
	void rejectsUnreadablePdf() throws IOException {
		byte[] encrypted = encryptedPdf();
		byte[] broken = "%PDF-1.7\nnot a pdf".getBytes(StandardCharsets.US_ASCII);

		assertThat(status(() -> extractor.extract(encrypted))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
		assertThat(status(() -> extractor.extract(broken))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
	}

	@Test
	void extractsDocxWithTable() throws IOException {
		assertThat(extractor.extract(docx())).contains(CYRILLIC, "Kotlin", "PostgreSQL");
	}

	@Test
	void rejectsZipThatIsNotDocx() throws IOException {
		byte[] xlsx = xlsx();
		byte[] zip = zip("notes.txt", "hello".getBytes(StandardCharsets.UTF_8));

		assertThat(status(() -> extractor.extract(xlsx))).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
		assertThat(status(() -> extractor.extract(zip))).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
	}

	@Test
	void rejectsDocxBomb() throws IOException {
		byte[] bomb = withPaddedDocument(docx(), 25 * 1024 * 1024);

		assertThat(status(() -> extractor.extract(bomb))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
	}

	@Test
	void rejectsDocxWithLargeEntryBelowBombRatio() throws IOException {
		byte[] document = docx();
		byte[] large = withEntry(document, "word/media/padding.bin", randomLetters(25 * 1024 * 1024));

		assertThat(status(() -> extractor.extract(large))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
	}

	@Test
	void decodesPlainText() {
		Charset windows1251 = Charset.forName("windows-1251");
		byte[] utf8Bom = concat(new byte[] {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF}, CYRILLIC.getBytes(StandardCharsets.UTF_8));
		byte[] utf16Le = concat(new byte[] {(byte) 0xFF, (byte) 0xFE}, CYRILLIC.getBytes(StandardCharsets.UTF_16LE));
		byte[] utf16Be = concat(new byte[] {(byte) 0xFE, (byte) 0xFF}, CYRILLIC.getBytes(StandardCharsets.UTF_16BE));

		assertThat(extractor.extract(CYRILLIC.getBytes(StandardCharsets.UTF_8))).isEqualTo(CYRILLIC);
		assertThat(extractor.extract(CYRILLIC.getBytes(windows1251))).isEqualTo(CYRILLIC);
		assertThat(extractor.extract(utf8Bom)).isEqualTo(CYRILLIC);
		assertThat(extractor.extract(utf16Le)).isEqualTo(CYRILLIC);
		assertThat(extractor.extract(utf16Be)).isEqualTo(CYRILLIC);
	}

	@Test
	void rejectsUnsupportedFormats() {
		List<byte[]> files = List.of(
				new byte[] {'M', 'Z', (byte) 0x90, 0, 3, 0, 0, 0},
				Arrays.copyOf(new byte[] {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1}, 512),
				"{\\rtf1\\ansi Resume}".getBytes(StandardCharsets.US_ASCII),
				"<html><body>Resume</body></html>".getBytes(StandardCharsets.UTF_8),
				"  \n<svg xmlns=\"http://www.w3.org/2000/svg\"/>".getBytes(StandardCharsets.UTF_8));

		for (byte[] file : files) {
			assertThat(status(() -> extractor.extract(file))).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
		}
	}

	@Test
	void rejectsTooLongText() {
		byte[] bytes = "a".repeat(ResumeTextExtractor.MAX_CHARS + 1).getBytes(StandardCharsets.UTF_8);

		assertThat(status(() -> extractor.extract(bytes))).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
	}

	private static HttpStatusCode status(ThrowingCallable call) {
		ResponseStatusException exception = catchThrowableOfType(ResponseStatusException.class, call);
		assertThat(exception).isNotNull();
		return exception.getStatusCode();
	}

	private static byte[] pdf(List<String> pages) throws IOException {
		return pdf(pages, 1);
	}

	private static byte[] pdf(List<String> pages, int linesPerPage) throws IOException {
		try (PDDocument document = new PDDocument()) {
			PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
			for (String line : pages) {
				PDPage page = new PDPage();
				document.addPage(page);
				if (line.isEmpty()) {
					continue;
				}
				try (PDPageContentStream content = new PDPageContentStream(document, page)) {
					content.beginText();
					content.setFont(font, 4);
					content.newLineAtOffset(10, 780);
					for (int i = 0; i < linesPerPage; i++) {
						content.showText(line);
						content.newLineAtOffset(0, -6);
					}
					content.endText();
				}
			}
			return save(document);
		}
	}

	private static byte[] encryptedPdf() throws IOException {
		try (PDDocument document = new PDDocument()) {
			document.addPage(new PDPage());
			StandardProtectionPolicy policy = new StandardProtectionPolicy("owner", "user", new AccessPermission());
			policy.setEncryptionKeyLength(128);
			document.protect(policy);
			return save(document);
		}
	}

	private static byte[] save(PDDocument document) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		document.save(out);
		return out.toByteArray();
	}

	private static byte[] docx() throws IOException {
		try (XWPFDocument document = new XWPFDocument()) {
			document.createParagraph().createRun().setText(CYRILLIC);
			XWPFTable table = document.createTable(1, 2);
			table.getRow(0).getCell(0).setText("Kotlin");
			table.getRow(0).getCell(1).setText("PostgreSQL");
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			document.write(out);
			return out.toByteArray();
		}
	}

	private static byte[] xlsx() throws IOException {
		try (XSSFWorkbook workbook = new XSSFWorkbook()) {
			workbook.createSheet().createRow(0).createCell(0).setCellValue("Resume");
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private static byte[] zip(String name, byte[] content) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		try (ZipOutputStream zip = new ZipOutputStream(out)) {
			zip.putNextEntry(new ZipEntry(name));
			zip.write(content);
			zip.closeEntry();
		}
		return out.toByteArray();
	}

	private static byte[] withPaddedDocument(byte[] docx, int padding) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		try (ZipInputStream in = new ZipInputStream(new ByteArrayInputStream(docx));
				ZipOutputStream zip = new ZipOutputStream(out)) {
			for (ZipEntry entry = in.getNextEntry(); entry != null; entry = in.getNextEntry()) {
				zip.putNextEntry(new ZipEntry(entry.getName()));
				zip.write(in.readAllBytes());
				if (entry.getName().equals("word/document.xml")) {
					byte[] spaces = new byte[1024 * 1024];
					Arrays.fill(spaces, (byte) ' ');
					for (int written = 0; written < padding; written += spaces.length) {
						zip.write(spaces);
					}
				}
				zip.closeEntry();
			}
		}
		return out.toByteArray();
	}

	private static byte[] withEntry(byte[] docx, String name, byte[] content) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		try (ZipInputStream in = new ZipInputStream(new ByteArrayInputStream(docx));
				ZipOutputStream zip = new ZipOutputStream(out)) {
			for (ZipEntry entry = in.getNextEntry(); entry != null; entry = in.getNextEntry()) {
				zip.putNextEntry(new ZipEntry(entry.getName()));
				zip.write(in.readAllBytes());
				zip.closeEntry();
			}
			zip.putNextEntry(new ZipEntry(name));
			zip.write(content);
			zip.closeEntry();
		}
		return out.toByteArray();
	}

	private static byte[] spaces(int size) {
		byte[] bytes = new byte[size];
		Arrays.fill(bytes, (byte) ' ');
		return bytes;
	}

	private static byte[] randomLetters(int size) {
		byte[] bytes = new byte[size];
		Random random = new Random(1);
		for (int i = 0; i < size; i++) {
			bytes[i] = (byte) ('a' + random.nextInt(26));
		}
		return bytes;
	}

	private static byte[] concat(byte[] first, byte[] second) {
		byte[] result = Arrays.copyOf(first, first.length + second.length);
		System.arraycopy(second, 0, result, first.length, second.length);
		return result;
	}

}
