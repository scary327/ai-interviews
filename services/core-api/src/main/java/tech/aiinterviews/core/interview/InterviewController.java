package tech.aiinterviews.core.interview;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

	private final InterviewService interviewService;

	public InterviewController(InterviewService interviewService) {
		this.interviewService = interviewService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public InterviewResponse create(@AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody CreateInterviewRequest request) {
		return interviewService.create(userId(jwt), request);
	}

	@GetMapping
	public List<InterviewResponse> list(@AuthenticationPrincipal Jwt jwt) {
		return interviewService.list(userId(jwt));
	}

	@GetMapping("/{id}")
	public InterviewResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
		return interviewService.get(userId(jwt), id);
	}

	private static UUID userId(Jwt jwt) {
		return UUID.fromString(jwt.getSubject());
	}

}
