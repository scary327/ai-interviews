package tech.aiinterviews.core.resume;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.contentstream.operator.Operator;
import org.apache.pdfbox.cos.COSBase;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.apache.poi.UnsupportedFileFormatException;
import org.apache.poi.ooxml.POIXMLException;
import org.apache.poi.openxml4j.util.ZipInputStreamZipEntrySource;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Component
public class ResumeTextExtractor {

	static final int MAX_CHARS = 100_000;
	private static final int MAX_PDF_PAGES = 20;
	private static final long MAX_PAGE_CONTENT_BYTES = 10L * 1024 * 1024;
	private static final long MAX_PDF_NANOS = 5_000_000_000L;
	private static final long MAX_ZIP_ENTRY_BYTES = 20L * 1024 * 1024;
	private static final int ZIP_ENTRY_IN_MEMORY_BYTES = 1024 * 1024;

	private static final byte[] PDF = {'%', 'P', 'D', 'F', '-'};
	private static final byte[] ZIP = {'P', 'K', 3, 4};
	private static final byte[] UTF8_BOM = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
	private static final byte[] UTF16LE_BOM = {(byte) 0xFF, (byte) 0xFE};
	private static final byte[] UTF16BE_BOM = {(byte) 0xFE, (byte) 0xFF};
	private static final Charset WINDOWS_1251 = Charset.forName("windows-1251");

	static {
		ZipSecureFile.setMaxEntrySize(MAX_ZIP_ENTRY_BYTES);
		ZipInputStreamZipEntrySource.setThresholdBytesForTempFiles(ZIP_ENTRY_IN_MEMORY_BYTES);
	}

	public String extract(byte[] bytes) {
		String text;
		if (startsWith(bytes, PDF)) {
			text = pdf(bytes);
		} else if (startsWith(bytes, ZIP)) {
			text = docx(bytes);
		} else {
			text = plain(bytes);
		}
		if (text.length() > MAX_CHARS) {
			throw unreadable();
		}
		return text;
	}

	private static String pdf(byte[] bytes) {
		try (PDDocument document = Loader.loadPDF(bytes)) {
			PDFTextStripper stripper = new LimitedTextStripper();
			stripper.setEndPage(MAX_PDF_PAGES);
			return stripper.getText(document);
		} catch (IOException | RuntimeException e) {
			throw unreadable();
		}
	}

	private static String docx(byte[] bytes) {
		try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(bytes));
				XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
			return extractor.getText();
		} catch (UnsupportedFileFormatException | POIXMLException e) {
			throw unsupported();
		} catch (IOException | RuntimeException e) {
			throw unreadable();
		}
	}

	private static String plain(byte[] bytes) {
		String text;
		if (startsWith(bytes, UTF8_BOM)) {
			text = new String(bytes, UTF8_BOM.length, bytes.length - UTF8_BOM.length, StandardCharsets.UTF_8);
		} else if (startsWith(bytes, UTF16LE_BOM)) {
			text = new String(bytes, 2, bytes.length - 2, StandardCharsets.UTF_16LE);
		} else if (startsWith(bytes, UTF16BE_BOM)) {
			text = new String(bytes, 2, bytes.length - 2, StandardCharsets.UTF_16BE);
		} else {
			for (byte b : bytes) {
				if (b == 0) {
					throw unsupported();
				}
			}
			text = utf8OrWindows1251(bytes);
		}
		String head = text.stripLeading();
		if (head.startsWith("{\\rtf") || head.startsWith("<")) {
			throw unsupported();
		}
		return text;
	}

	private static String utf8OrWindows1251(byte[] bytes) {
		try {
			return StandardCharsets.UTF_8.newDecoder()
					.onMalformedInput(CodingErrorAction.REPORT)
					.onUnmappableCharacter(CodingErrorAction.REPORT)
					.decode(ByteBuffer.wrap(bytes))
					.toString();
		} catch (CharacterCodingException e) {
			return new String(bytes, WINDOWS_1251);
		}
	}

	private static boolean startsWith(byte[] bytes, byte[] prefix) {
		return bytes.length >= prefix.length && Arrays.equals(bytes, 0, prefix.length, prefix, 0, prefix.length);
	}

	private static ResponseStatusException unsupported() {
		return new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF, DOCX and TXT are supported");
	}

	private static ResponseStatusException unreadable() {
		return new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "No readable text in the file");
	}

	private static final class LimitedTextStripper extends PDFTextStripper {

		private final long deadline = System.nanoTime() + MAX_PDF_NANOS;
		private int glyphs;

		@Override
		public void processPage(PDPage page) throws IOException {
			if (getCurrentPageNo() > getEndPage()) {
				return;
			}
			try (InputStream contents = page.getContents()) {
				byte[] buffer = new byte[8192];
				long total = 0;
				for (int read = contents.read(buffer); read != -1; read = contents.read(buffer)) {
					total += read;
					if (total > MAX_PAGE_CONTENT_BYTES) {
						throw new IllegalStateException("Page content is larger than " + MAX_PAGE_CONTENT_BYTES + " bytes");
					}
				}
			}
			super.processPage(page);
		}

		@Override
		protected void processOperator(Operator operator, List<COSBase> operands) throws IOException {
			if (System.nanoTime() > deadline) {
				throw new IllegalStateException("Text extraction took longer than " + MAX_PDF_NANOS + " ns");
			}
			super.processOperator(operator, operands);
		}

		@Override
		protected void processTextPosition(TextPosition text) {
			if (++glyphs > MAX_CHARS) {
				throw new IllegalStateException("Text is longer than " + MAX_CHARS + " characters");
			}
			super.processTextPosition(text);
		}

	}

}
