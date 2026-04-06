package org.tfg.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


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

    @Transactional(readOnly = true)
    public Page<ClientSearchDTO> searchClientsPaginated(String query, int page, int size) {
        return clientRepository.searchClients(query, PageRequest.of(page, size))
                .map(this::mapToSearchDTO);
    }

    private ClientSearchDTO mapToSearchDTO(Client client) {
        return ClientSearchDTO.builder()
                .id(client.getId())
                .firstname(client.getUser().getFirstname())
                .lastname(client.getUser().getLastname())
                .email(client.getUser().getEmail())
                .nif(client.getNif())
                .phoneNumber(client.getPhoneNumber())
                .build();
    }

    @Transactional
    public ClientSearchDTO registerManualClient(ClientSearchDTO request) {
        // Validaciones básicas
        if (request.getNif() == null || request.getNif().trim().isEmpty()) {
            throw new RuntimeException("El NIF es obligatorio");
        }

        if (clientRepository.existsByNif(request.getNif())) {
            throw new RuntimeException("Ya existe un cliente registrado con este NIF: " + request.getNif());
        }

        String email = (request.getEmail() != null && !request.getEmail().trim().isEmpty()) 
                        ? request.getEmail() 
                        : request.getNif().toLowerCase() + "@talleres-pitstop.com";

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Ya existe una cuenta con el email: " + email);
        }
        
        // Creamos un usuario base
        String tempPass = UUID.randomUUID().toString().substring(0, 8);
        
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(email)
                .password(passwordEncoder.encode(tempPass))
                .role(Role.CLIENT)
                .build();
        
        try {
            userRepository.save(user);

            Client client = Client.builder()
                    .user(user)
                    .nif(request.getNif())
                    .phoneNumber(request.getPhoneNumber())
                    .build();
            clientRepository.save(client);

            return mapToSearchDTO(client);
        } catch (Exception e) {
            throw new RuntimeException("Error técnico al guardar el cliente: " + e.getMessage());
        }
    }
}