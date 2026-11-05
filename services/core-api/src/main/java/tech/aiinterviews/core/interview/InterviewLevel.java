package tech.aiinterviews.core.interview;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum InterviewLevel {
	INTERN,
	JUNIOR,
	MIDDLE,
	SENIOR;

	@JsonValue
	public String toJson() {
		return name().toLowerCase(Locale.ROOT);
	}
}
