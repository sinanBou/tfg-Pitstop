package org.tfg.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.util.UUID;

/**
 * Servicio administrativo para la gestión de clientes en Pitstop.
 * Permite realizar búsquedas paginadas de clientes y registrar clientes de manera manual
 * por el personal del taller.
 */
@Service
@RequiredArgsConstructor
public class ClientAdminService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClientMapper clientMapper;

    /**
     * Busca clientes de manera paginada filtrando por nombre, apellidos, NIF o email.
     *
     * @param query Término de búsqueda.
     * @param page Número de página.
     * @param size Tamaño de la página.
     * @return Página de resultados mapeada a DTOs de búsqueda.
     */
    @Transactional(readOnly = true)
    public Page<ClientSearchDTO> searchClientsPaginated(String query, int page, int size) {
        return clientRepository.searchClients(query, PageRequest.of(page, size))
                .map(clientMapper::mapToSearchDTO);
    }

    /**
     * Registra un cliente de forma manual en el sistema. Genera un usuario base con una contraseña
     * temporal y asocia los datos del cliente y su NIF.
     *
     * @param request Datos del cliente a registrar.
     * @return DTO del cliente recién registrado.
     */
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

            return clientMapper.mapToSearchDTO(client);
        } catch (Exception e) {
            throw new RuntimeException("Error técnico al guardar el cliente: " + e.getMessage());
        }
    }
}
