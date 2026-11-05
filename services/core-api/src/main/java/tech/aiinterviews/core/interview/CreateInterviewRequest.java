package tech.aiinterviews.core.interview;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateInterviewRequest(
		@NotBlank @Size(max = 255) String position,
		@NotNull InterviewLevel level,
		@Size(max = 20) List<@NotBlank @Size(max = 255) String> topics
) {
}
