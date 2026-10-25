package tech.aiinterviews.core.auth.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.file.Path;
import java.time.Duration;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(Path privateKeyPath, Duration accessTtl) {
}