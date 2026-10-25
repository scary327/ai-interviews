package tech.aiinterviews.core.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class EmailAlreadyUsedException extends ResponseStatusException {

    public EmailAlreadyUsedException() {
        super(HttpStatus.CONFLICT, "Email already registered");
    }
}