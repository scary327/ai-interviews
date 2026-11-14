package tech.aiinterviews.core.interview;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "interview_results")
public class InterviewResult {

	@Id
	@Column(name = "interview_id")
	private UUID interviewId;

	@MapsId
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "interview_id")
	private Interview interview;

	@Column(nullable = false)
	private int score;

	@Column(nullable = false)
	private String summary;

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(nullable = false)
	private List<String> strengths = new ArrayList<>();

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(nullable = false)
	private List<String> weaknesses = new ArrayList<>();

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(nullable = false)
	private List<String> recommendations = new ArrayList<>();

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = false)
	private List<CriterionScore> criteria = new ArrayList<>();

	protected InterviewResult() {
	}

	public InterviewResult(Interview interview) {
		this.interview = interview;
	}

	public void update(InterviewResultDto dto) {
		this.score = dto.score();
		this.summary = dto.summary();
		this.strengths = new ArrayList<>(dto.strengths());
		this.weaknesses = new ArrayList<>(dto.weaknesses());
		this.recommendations = new ArrayList<>(dto.recommendations());
		this.criteria = new ArrayList<>(dto.criteria());
	}

	public int getScore() {
		return score;
	}

	public String getSummary() {
		return summary;
	}

	public List<String> getStrengths() {
		return strengths;
	}

	public List<String> getWeaknesses() {
		return weaknesses;
	}

	public List<String> getRecommendations() {
		return recommendations;
	}

	public List<CriterionScore> getCriteria() {
		return criteria;
	}

}
