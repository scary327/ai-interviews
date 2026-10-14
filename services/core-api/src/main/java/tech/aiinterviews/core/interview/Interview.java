package tech.aiinterviews.core.interview;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tech.aiinterviews.core.user.User;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "interviews")
public class Interview {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private String position;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private InterviewLevel level;

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(nullable = false)
	private List<String> topics = new ArrayList<>();

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private InterviewStatus status = InterviewStatus.CREATED;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected Interview() {
	}

	public Interview(User user, String position, InterviewLevel level, List<String> topics) {
		this.user = user;
		this.position = position;
		this.level = level;
		this.topics = topics == null ? new ArrayList<>() : new ArrayList<>(topics);
	}

	public UUID getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public String getPosition() {
		return position;
	}

	public InterviewLevel getLevel() {
		return level;
	}

	public List<String> getTopics() {
		return topics;
	}

	public InterviewStatus getStatus() {
		return status;
	}

	public void setStatus(InterviewStatus status) {
		this.status = status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

}
