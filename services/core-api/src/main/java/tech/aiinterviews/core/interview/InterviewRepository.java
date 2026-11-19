package tech.aiinterviews.core.interview;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<Interview, UUID> {

	@EntityGraph(attributePaths = "result")
	List<Interview> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

	@EntityGraph(attributePaths = "result")
	Optional<Interview> findByIdAndUserId(UUID id, UUID userId);

	@EntityGraph(attributePaths = "result")
	Optional<Interview> findWithResultById(UUID id);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Interview> findLockedById(UUID id);

	@Query("select new tech.aiinterviews.core.interview.InternalInterviewContext(i.resumeText, i.vacancyText) "
			+ "from Interview i where i.id = :id")
	Optional<InternalInterviewContext> findContextById(UUID id);

}
