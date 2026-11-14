package tech.aiinterviews.core.interview;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CriterionScore(
		@NotBlank @Pattern(regexp = KEY_PATTERN) String key,
		@NotNull @Min(0) @Max(100) Integer score,
		@NotBlank @Size(max = 1000) String comment
) {

	static final String KEY_PATTERN = "technical_knowledge|practical_depth|communication|problem_solving";

	static final Set<String> KEYS = Set.of(KEY_PATTERN.split("\\|"));

}
