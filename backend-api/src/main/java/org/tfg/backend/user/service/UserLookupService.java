package org.tfg.backend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserDTO;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.mapper.UserMapper;

/**
 * Servicio especializado para la búsqueda y lectura de perfiles de usuario.
 * Proporciona métodos de solo lectura optimizados transaccionalmente.
 */
@Service
@RequiredArgsConstructor
public class UserLookupService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Obtiene el perfil de un usuario dado su correo electrónico y lo mapea a un DTO seguro.
     *
     * @param email Correo electrónico del usuario a consultar.
     * @return DTO del perfil del usuario encontrado.
     * @throws RuntimeException si el usuario no existe en la base de datos.
     */
    @Transactional(readOnly = true)
    public UserDTO getUserDetails(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return userMapper.mapToDTO(user);
    }
}
