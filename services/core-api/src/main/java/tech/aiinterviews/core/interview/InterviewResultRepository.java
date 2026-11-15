package tech.aiinterviews.core.interview;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InterviewResultRepository extends JpaRepository<InterviewResult, UUID> {

}
