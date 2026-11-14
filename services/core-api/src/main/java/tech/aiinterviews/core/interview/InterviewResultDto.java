package tech.aiinterviews.core.interview;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record InterviewResultDto(
		@NotNull @Min(0) @Max(100) Integer score,
		@NotBlank @Size(max = 4000) String summary,
		@NotNull @Size(max = 10) List<@NotBlank @Size(max = 500) String> strengths,
		@NotNull @Size(max = 10) List<@NotBlank @Size(max = 500) String> weaknesses,
		@NotNull @Size(min = 4, max = 4) List<@Valid @NotNull CriterionScore> criteria,
		@NotNull @Size(max = 10) List<@NotBlank @Size(max = 500) String> recommendations
) {

	public static InterviewResultDto from(InterviewResult result) {
		return new InterviewResultDto(
				result.getScore(),
				result.getSummary(),
				List.copyOf(result.getStrengths()),
				List.copyOf(result.getWeaknesses()),
				List.copyOf(result.getCriteria()),
				List.copyOf(result.getRecommendations())
		);
	}

}
