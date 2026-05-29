package org.tfg.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

@Service
@RequiredArgsConstructor
public class ClientProfileService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Transactional(readOnly = true)
    public ClientDTO getClientProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Client client = user.getClient();
        if (client == null) {
            throw new RuntimeException("El usuario no tiene un perfil de cliente asociado");
        }

        return clientMapper.mapToDTO(client);
    }

    @Transactional
    public ClientDTO updateProfile(String email, ClientDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Client client = user.getClient();
        if (client == null) {
            throw new RuntimeException("El usuario no tiene un perfil de cliente asociado");
        }

        if (request.getFirstname() != null && !request.getFirstname().isBlank()) {
            user.setFirstname(request.getFirstname().trim());
        }
        if (request.getLastname() != null && !request.getLastname().isBlank()) {
            user.setLastname(request.getLastname().trim());
        }
        userRepository.save(user);

        if (request.getPhoneNumber() != null) {
            client.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getAddress() != null) {
            client.setAddress(request.getAddress().trim());
        }
        clientRepository.save(client);

        return clientMapper.mapToDTO(client);
    }
}
