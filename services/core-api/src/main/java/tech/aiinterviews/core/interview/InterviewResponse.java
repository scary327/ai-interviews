package tech.aiinterviews.core.interview;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InterviewResponse(
		UUID id,
		String position,
		InterviewLevel level,
		InterviewStatus status,
		Instant createdAt,
		List<String> topics,
		InterviewResultDto result
) {

	public static InterviewResponse from(Interview interview) {
		return new InterviewResponse(
				interview.getId(),
				interview.getPosition(),
				interview.getLevel(),
				interview.getStatus(),
				interview.getCreatedAt(),
				List.copyOf(interview.getTopics()),
				interview.getResult() == null ? null : InterviewResultDto.from(interview.getResult())
		);
	}

}
