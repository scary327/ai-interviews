package tech.aiinterviews.core.interview;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tech.aiinterviews.core.user.User;
import tech.aiinterviews.core.user.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
public class InterviewService {

	private final InterviewRepository interviewRepository;
	private final UserRepository userRepository;

	public InterviewService(InterviewRepository interviewRepository, UserRepository userRepository) {
		this.interviewRepository = interviewRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public InterviewResponse create(UUID userId, CreateInterviewRequest request) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
		List<String> topics = request.topics() == null
				? List.of()
				: request.topics().stream().map(String::trim).distinct().toList();
		Interview interview = new Interview(user, request.position().trim(), request.level(), topics);
		return InterviewResponse.from(interviewRepository.saveAndFlush(interview));
	}

	@Transactional(readOnly = true)
	public List<InterviewResponse> list(UUID userId) {
		return interviewRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(InterviewResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public InterviewResponse get(UUID userId, UUID id) {
		return interviewRepository.findByIdAndUserId(id, userId)
				.map(InterviewResponse::from)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));
	}

}
