package tech.aiinterviews.core.internal;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import tech.aiinterviews.core.interview.InternalInterviewResponse;
import tech.aiinterviews.core.interview.InterviewResultDto;
import tech.aiinterviews.core.interview.InterviewService;

import java.util.UUID;

@RestController
@RequestMapping("/internal/interviews")
public class InternalInterviewController {

	private final InterviewService interviewService;

	public InternalInterviewController(InterviewService interviewService) {
		this.interviewService = interviewService;
	}

	@GetMapping("/{id}")
	public InternalInterviewResponse get(@PathVariable UUID id) {
		return interviewService.getForInternal(id);
	}

	@PostMapping("/{id}/start")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void start(@PathVariable UUID id) {
		interviewService.start(id);
	}

	@PutMapping("/{id}/result")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void saveResult(@PathVariable UUID id, @Valid @RequestBody InterviewResultDto result) {
		interviewService.saveResult(id, result);
	}

}
