package tech.aiinterviews.core.interview;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tech.aiinterviews.core.user.User;
import tech.aiinterviews.core.user.UserRepository;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InterviewService {

	private final InterviewRepository interviewRepository;
	private final InterviewResultRepository interviewResultRepository;
	private final UserRepository userRepository;

	public InterviewService(InterviewRepository interviewRepository,
			InterviewResultRepository interviewResultRepository, UserRepository userRepository) {
		this.interviewRepository = interviewRepository;
		this.interviewResultRepository = interviewResultRepository;
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
				.orElseThrow(InterviewService::notFound);
	}

	@Transactional(readOnly = true)
	public InternalInterviewResponse getForInternal(UUID id) {
		return interviewRepository.findWithResultById(id)
				.map(InternalInterviewResponse::from)
				.orElseThrow(InterviewService::notFound);
	}

	@Transactional
	public void start(UUID id) {
		Interview interview = interviewRepository.findLockedById(id).orElseThrow(InterviewService::notFound);
		if (interview.getStatus() == InterviewStatus.FINISHED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Interview already finished");
		}
		if (interview.getStatus() == InterviewStatus.CREATED) {
			interview.setStatus(InterviewStatus.IN_PROGRESS);
		}
	}

	@Transactional
	public void saveResult(UUID id, InterviewResultDto dto) {
		Interview interview = interviewRepository.findLockedById(id).orElseThrow(InterviewService::notFound);
		if (interview.getStatus() == InterviewStatus.CREATED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Interview has not started");
		}
		validateCriteria(dto);
		if (interview.getResult() == null) {
			InterviewResult result = new InterviewResult(interview);
			result.update(dto);
			interview.setResult(interviewResultRepository.save(result));
		} else {
			interview.getResult().update(dto);
		}
		interview.setStatus(InterviewStatus.FINISHED);
	}

	private static void validateCriteria(InterviewResultDto dto) {
		Set<String> keys = dto.criteria().stream().map(CriterionScore::key).collect(Collectors.toSet());
		if (!keys.equals(CriterionScore.KEYS)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each criterion key must appear exactly once");
		}
		int sum = dto.criteria().stream().mapToInt(CriterionScore::score).sum();
		long expected = Math.round(sum / (double) dto.criteria().size());
		if (dto.score() != expected) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Score must be the rounded average of criteria scores: " + expected);
		}
	}

	private static ResponseStatusException notFound() {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found");
	}

}
