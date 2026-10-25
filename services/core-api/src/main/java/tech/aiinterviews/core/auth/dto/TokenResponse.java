package tech.aiinterviews.core.auth.dto;

public record TokenResponse(String accessToken, long expiresIn) {
}