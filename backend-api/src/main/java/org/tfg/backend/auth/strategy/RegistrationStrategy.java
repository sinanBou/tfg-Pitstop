package org.tfg.backend.auth.strategy;

import org.tfg.backend.auth.RegisterRequest;
import org.tfg.backend.user.User;
import org.tfg.backend.user.Role;

public interface RegistrationStrategy {
    void register(RegisterRequest request, User user);
    boolean supports(Role role);
}
