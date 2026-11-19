package tech.aiinterviews.core.resume;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;

class ResumeAnonymizerTest {

	private final ResumeAnonymizer anonymizer = new ResumeAnonymizer();

	@Test
	void replacesContactsAndName() {
		String text = """
				Иван Петров
				Email: ivan.petrov@mail.ru, почта: иван@почта.рф
				Телефон: +7 (999) 123-45-67, 8 999 123 45 67, +375 29 123 45 67
				GitHub: https://github.com/ivanp, linkedin.com/in/ivan, spb.hh.ru/resume/123
				Telegram: @ivan_dev, tg @ivan2
				Дата рождения: 05.03.1995
				Мужчина, 29 лет, родился 15 марта 1995
				ИВАН ПЕТРОВ, Java Developer""";

		String result = anonymizer.anonymize(text, "Иван Петров");

		assertThat(result).isEqualTo("""
				[имя] [имя]
				Email: [email], почта: [email]
				Телефон: [телефон], [телефон], [телефон]
				GitHub: [ссылка], [ссылка], [ссылка]
				Telegram: [ник], tg [ник]
				Дата рождения: [дата]
				Мужчина, 29 лет, родился [дата]
				[имя] [имя], Java Developer""");
	}

	@Test
	void keepsTechnicalText() {
		String text = """
				@Transactional, @Autowired, @types/node@20.1.0, react@18.3.1
				Telegram-бот на aiogram: @dp.message_handler, @router.message
				2018 2019 2020, 1 000 000 000, Java 8 2018 2019 2020, C++17 2018 2019 2020
				Java 17, C++, Python 3.10.2, 2019–2023, email-рассылки, зарплата 150 000 руб.
				Math.max, Integer.MAX_VALUE, MAX_POOL_SIZE, t.method(), localhost:8080
				01.09.2019 – 31.12.2021, ООО Ромашка""";

		assertThat(anonymizer.anonymize(text, "Max")).isEqualTo(text);
	}

	@Test
	void worksWithoutName() {
		assertThat(anonymizer.anonymize("Max, max@mail.ru", null)).isEqualTo("Max, [email]");
		assertThat(anonymizer.anonymize("Max, max@mail.ru", "  ")).isEqualTo("Max, [email]");
	}

	@Test
	void normalizesExportedText() {
		String nfdName = "Андре" + (char) 0x0438 + (char) 0x0306;
		String softHyphenName = "Ан" + (char) 0x00AD + "дрей";
		String nbspPhone = "+7" + (char) 0x00A0 + "999" + (char) 0x00A0 + "123-45-67";
		String nonBreakingHyphenPhone = "8 999 123" + (char) 0x2011 + "45" + (char) 0x2011 + "67";
		String text = nfdName + ", " + softHyphenName + ", " + nbspPhone + ", " + nonBreakingHyphenPhone
				+ "\r\n\r\n\r\n\r\na" + (char) 0 + "b";

		assertThat(anonymizer.anonymize(text, "Андрей"))
				.isEqualTo("[имя], [имя], [телефон], [телефон]\n\nab");
	}

	@Test
	void handlesLongInputQuickly() {
		int length = 2 * ResumeTextExtractor.MAX_CHARS;
		List<String> inputs = List.of("a", "a.", "a@", "1 ", "+1", "telegram ", "\n", "a\n \n", "a@b.", "x.github.")
				.stream()
				.map(unit -> unit.repeat(length / unit.length()))
				.collect(Collectors.toCollection(ArrayList::new));
		inputs.add("https://" + "a".repeat(length));
		inputs.add("tg" + " ".repeat(length) + "x");
		inputs.add("родился" + " ".repeat(length) + "x");
		inputs.add("дата рождения" + " ".repeat(length) + "x");

		assertTimeoutPreemptively(Duration.ofSeconds(5), () -> {
			for (String input : inputs) {
				anonymizer.anonymize(input, "Иван Петров");
			}
		});
	}

}
