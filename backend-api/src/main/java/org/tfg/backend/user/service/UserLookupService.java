package org.tfg.backend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserDTO;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.mapper.UserMapper;

/**
 * Servicio transaccional de lectura optimizada para la obtención y consulta de detalles de usuarios.
 */
@Service
@RequiredArgsConstructor
public class UserLookupService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Recupera y mapea la información pública de un usuario mediante su correo electrónico en una transacción de solo lectura.
     *
     * @param email Correo electrónico del usuario.
     * @return DTO con los detalles del usuario.
     * @throws RuntimeException Si el usuario no existe.
     */
    @Transactional(readOnly = true)
    public UserDTO getUserDetails(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return userMapper.mapToDTO(user);
    }
}
