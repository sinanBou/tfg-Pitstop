package org.tfg.backend.auth.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.user.Role;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RegistrationStrategyFactory {

    private final List<RegistrationStrategy> strategies;

    public RegistrationStrategy getStrategy(Role role) {
        return strategies.stream()
                .filter(s -> s.supports(role))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Estrategia de registro no soportada para el rol: " + role));
    }
}
