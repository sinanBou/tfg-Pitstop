package org.tfg.backend.user.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserDTO;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.mapper.UserMapper;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserLookupServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserLookupService userLookupService;

    private User mockUser;
    private UserDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("John")
                .lastname("Doe")
                .email("john@example.com")
                .role(Role.CLIENT)
                .build();

        mockDTO = UserDTO.builder()
                .id(mockUser.getId())
                .firstname("John")
                .lastname("Doe")
                .email("john@example.com")
                .role("CLIENT")
                .build();
    }

    @Test
    void getUserDetails_ShouldReturnDTO() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(userMapper.mapToDTO(mockUser)).thenReturn(mockDTO);

        UserDTO result = userLookupService.getUserDetails("john@example.com");

        assertNotNull(result);
        assertEquals(mockUser.getId(), result.getId());
        assertEquals("john@example.com", result.getEmail());
        verify(userRepository, times(1)).findByEmail("john@example.com");
        verify(userMapper, times(1)).mapToDTO(mockUser);
    }

    @Test
    void getUserDetails_ShouldThrowExceptionWhenNotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userLookupService.getUserDetails("notfound@example.com"));
        verify(userMapper, never()).mapToDTO(any());
    }
}
