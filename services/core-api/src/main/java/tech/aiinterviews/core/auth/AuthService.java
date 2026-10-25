package tech.aiinterviews.core.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.aiinterviews.core.auth.dto.LoginRequest;
import tech.aiinterviews.core.auth.dto.RegisterRequest;
import tech.aiinterviews.core.auth.dto.TokenResponse;
import tech.aiinterviews.core.auth.jwt.JwtService;
import tech.aiinterviews.core.user.User;
import tech.aiinterviews.core.user.UserRepository;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException();
        }
        String passwordHash = passwordEncoder.encode(request.password());
        User user = userRepository.save(new User(email, passwordHash, request.name()));
        return jwtService.issueAccessToken(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalize(request.email()))
                .filter(found -> passwordEncoder.matches(request.password(), found.getPassword()))
                .orElseThrow(InvalidCredentialsException::new);
        return jwtService.issueAccessToken(user);
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}