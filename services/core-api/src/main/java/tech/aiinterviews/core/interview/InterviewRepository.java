package tech.aiinterviews.core.interview;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<Interview, UUID> {

	List<Interview> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

}
