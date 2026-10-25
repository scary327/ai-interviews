package tech.aiinterviews.core.user.dto;

import tech.aiinterviews.core.user.User;

import java.util.UUID;

public record UserResponse(UUID id, String email, String name) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName());
    }
}