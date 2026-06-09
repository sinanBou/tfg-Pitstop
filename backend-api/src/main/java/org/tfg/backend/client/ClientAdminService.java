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
 * Servicio encargado de las acciones administrativas sobre los clientes,
 * incluyendo búsquedas globales y registros manuales.
 */
@Service
@RequiredArgsConstructor
public class ClientAdminService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClientMapper clientMapper;

    /**
     * Realiza una búsqueda paginada e insensible a mayúsculas/minúsculas de clientes.
     *
     * @param query Texto de filtro (nombre, email, NIF).
     * @param page Número de página.
     * @param size Cantidad de resultados por página.
     * @return Página de clientes en formato simplificado {@link ClientSearchDTO}.
     */
    @Transactional(readOnly = true)
    public Page<ClientSearchDTO> searchClientsPaginated(String query, int page, int size) {
        return clientRepository.searchClients(query, PageRequest.of(page, size))
                .map(clientMapper::mapToSearchDTO);
    }

    /**
     * Registra manualmente un cliente en la base de datos y le crea una cuenta de usuario provisional.
     *
     * @param request Datos del cliente a registrar.
     * @return DTO simplificado del cliente registrado.
     * @throws RuntimeException si faltan datos obligatorios o ya existen en la base de datos.
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

