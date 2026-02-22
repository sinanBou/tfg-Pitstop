package org.tfg.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    /**
     * Obtiene el perfil del cliente logueado a través de su email.
     */
    @Transactional(readOnly = true)
    public ClientDTO getClientProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Client client = user.getClient();
        if (client == null) {
            throw new RuntimeException("El usuario no tiene un perfil de cliente asociado");
        }

        return mapToDTO(client);
    }

    /**
     * Mapea la entidad Client a ClientDTO.
     */
    public ClientDTO mapToDTO(Client client) {
        return ClientDTO.builder()
                .id(client.getId())
                .firstname(client.getUser().getFirstname())
                .lastname(client.getUser().getLastname())
                .email(client.getUser().getEmail())
                .nif(client.getNif())
                .phoneNumber(client.getPhoneNumber())
                .address(client.getAddress())
                .build();
    }
}