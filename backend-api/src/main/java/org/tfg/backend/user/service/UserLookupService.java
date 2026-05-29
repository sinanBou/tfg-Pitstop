package org.tfg.backend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserDTO;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.mapper.UserMapper;

@Service
@RequiredArgsConstructor
public class UserLookupService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserDTO getUserDetails(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return userMapper.mapToDTO(user);
    }
}
