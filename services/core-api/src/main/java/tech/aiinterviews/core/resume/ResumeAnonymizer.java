package tech.aiinterviews.core.resume;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class ResumeAnonymizer {

	private static final int UNICODE = Pattern.UNICODE_CHARACTER_CLASS;
	private static final String URL_CHAR = "[^\\s<>()\\[\\]{}\"'«»]";
	private static final String URL_END = "[^\\s<>()\\[\\]{}\"'«».,;:!?]";

	private static final Pattern INVISIBLE = Pattern.compile("[\\x{0}\\x{AD}\\x{200B}\\x{FEFF}]");
	private static final Pattern SPACES = Pattern.compile("[\\x{A0}\\x{2007}\\x{202F}]");
	private static final Pattern HYPHENS = Pattern.compile("[\\x{2010}\\x{2011}]");
	private static final Pattern LINE_BREAKS = Pattern.compile("\\r\\n?");
	private static final Pattern BLANK_LINES = Pattern.compile("\\n[ \\t]*\\n[ \\t\\n]*\\n");

	private static final Pattern EMAIL = Pattern.compile(
			"(?<![\\w.+%-])[\\w.+%-]++@[\\w-][\\w.-]*\\.\\p{L}{2,}(?![\\w-])", UNICODE);
	private static final Pattern LINK = Pattern.compile(
			"(?<![\\w/])(?:https?://|www\\.)" + URL_CHAR + "*" + URL_END
					+ "|(?<![\\w.-])(?:[\\w-][\\w.-]*\\.)?(?:github\\.com|gitlab\\.com|linkedin\\.com|t\\.me|vk\\.com|hh\\.ru)"
					+ "(?![\\w-])(?:/(?:" + URL_CHAR + "*" + URL_END + ")?)?",
			UNICODE | Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
	private static final Pattern NICK = Pattern.compile(
			"(?<!\\p{L})(telegram|телеграмм?|tg)(\\s*+[:—–-]?\\s*+)@\\w+",
			UNICODE | Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
	private static final Pattern PHONE = Pattern.compile(
			"(?<![\\w+])(?:\\+\\d(?:[\\s().-]{0,2}\\d){9,13}"
					+ "|[78][\\s-]?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{2}[\\s-]?\\d{2})(?!\\d)",
			UNICODE);
	private static final Pattern BIRTH_DATE = Pattern.compile(
			"(?<!\\p{L})(дата\\s++рождения|д\\.\\s?р\\.|date\\s++of\\s++birth|birth\\s*+date|dob)(\\s*+[:—–-]?\\s*+)"
					+ "\\d{1,2}[./]\\d{1,2}[./]\\d{4}(?!\\d)"
					+ "|(?<!\\p{L})(родил(?:ся|ась)|born)(\\s++)(?:в\\s++)?\\d{1,2}\\s++\\p{L}++\\s++\\d{4}(?:\\s*+г\\.?)?",
			UNICODE | Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

	public String anonymize(String text, String userName) {
		String result = normalize(text);
		result = EMAIL.matcher(result).replaceAll("[email]");
		result = LINK.matcher(result).replaceAll("[ссылка]");
		result = NICK.matcher(result).replaceAll("$1$2[ник]");
		result = PHONE.matcher(result).replaceAll("[телефон]");
		result = BIRTH_DATE.matcher(result).replaceAll(match -> match.group(1) != null
				? match.group(1) + match.group(2) + "[дата]"
				: match.group(3) + match.group(4) + "[дата]");
		Pattern name = namePattern(userName);
		return name == null ? result : name.matcher(result).replaceAll("[имя]");
	}

	private static String normalize(String text) {
		String result = Normalizer.normalize(text, Normalizer.Form.NFC);
		result = INVISIBLE.matcher(result).replaceAll("");
		result = SPACES.matcher(result).replaceAll(" ");
		result = HYPHENS.matcher(result).replaceAll("-");
		result = LINE_BREAKS.matcher(result).replaceAll("\n");
		result = BLANK_LINES.matcher(result).replaceAll("\n\n");
		return result.strip();
	}

	private static Pattern namePattern(String userName) {
		if (userName == null || userName.isBlank()) {
			return null;
		}
		Set<String> variants = new LinkedHashSet<>();
		for (String word : Normalizer.normalize(userName, Normalizer.Form.NFC).split("[\\s-]+")) {
			if (word.codePoints().filter(Character::isLetter).count() < 2) {
				continue;
			}
			variants.add(word);
			variants.add(word.substring(0, 1).toUpperCase(Locale.ROOT) + word.substring(1).toLowerCase(Locale.ROOT));
			variants.add(word.toUpperCase(Locale.ROOT));
		}
		if (variants.isEmpty()) {
			return null;
		}
		String alternatives = variants.stream().map(Pattern::quote).collect(Collectors.joining("|"));
		return Pattern.compile("(?<![\\p{L}\\p{N}_])(?:" + alternatives + ")(?![\\p{L}\\p{N}_])");
	}

}
