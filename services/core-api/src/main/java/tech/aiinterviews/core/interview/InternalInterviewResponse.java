package tech.aiinterviews.core.interview;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

import java.util.UUID;

public record InternalInterviewResponse(
		@JsonUnwrapped InterviewResponse interview,
		UUID userId
) {

	public static InternalInterviewResponse from(Interview interview) {
		return new InternalInterviewResponse(InterviewResponse.from(interview), interview.getUser().getId());
	}

}
