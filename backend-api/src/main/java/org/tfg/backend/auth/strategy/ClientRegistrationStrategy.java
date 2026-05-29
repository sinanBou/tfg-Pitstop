package org.tfg.backend.auth.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.auth.RegisterRequest;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;
import org.tfg.backend.user.User;
import org.tfg.backend.user.Role;

@Component
@RequiredArgsConstructor
public class ClientRegistrationStrategy implements RegistrationStrategy {

    private final ClientRepository clientRepository;

    @Override
    public void register(RegisterRequest request, User user) {
        if (clientRepository.existsByNif(request.getNif())) {
            throw new RuntimeException("El NIF ya está registrado.");
        }

        Client client = Client.builder()
                .user(user)
                .nif(request.getNif())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .build();
        clientRepository.save(client);
    }

    @Override
    public boolean supports(Role role) {
        return role == Role.CLIENT;
    }
}
