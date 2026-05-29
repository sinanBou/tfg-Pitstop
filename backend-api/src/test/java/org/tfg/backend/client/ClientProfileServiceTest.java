package org.tfg.backend.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ClientMapper clientMapper;

    @InjectMocks
    private ClientProfileService clientProfileService;

    private User testUser;
    private Client testClient;
    private ClientDTO testDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .build();

        testClient = Client.builder()
                .user(testUser)
                .nif("12345678A")
                .phoneNumber("666777888")
                .address("Calle Pitstop 1")
                .build();

        testUser.setClient(testClient);

        testDTO = ClientDTO.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .nif("12345678A")
                .phoneNumber("666777888")
                .address("Calle Pitstop 1")
                .build();
    }

    @Test
    void getClientProfile_ShouldReturnDTO() {
        when(userRepository.findByEmail("sinan@pitstop.com")).thenReturn(Optional.of(testUser));
        when(clientMapper.mapToDTO(testClient)).thenReturn(testDTO);

        ClientDTO result = clientProfileService.getClientProfile("sinan@pitstop.com");

        assertNotNull(result);
        assertEquals("sinan@pitstop.com", result.getEmail());
        assertEquals("12345678A", result.getNif());
        verify(userRepository, times(1)).findByEmail("sinan@pitstop.com");
        verify(clientMapper, times(1)).mapToDTO(testClient);
    }

    @Test
    void getClientProfile_ShouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("sinan@pitstop.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> clientProfileService.getClientProfile("sinan@pitstop.com"));
        verify(userRepository, times(1)).findByEmail("sinan@pitstop.com");
    }

    @Test
    void getClientProfile_ShouldThrowExceptionWhenNotClient() {
        testUser.setClient(null);
        when(userRepository.findByEmail("sinan@pitstop.com")).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> clientProfileService.getClientProfile("sinan@pitstop.com"));
    }

    @Test
    void updateProfile_ShouldUpdateFieldsAndReturnDTO() {
        when(userRepository.findByEmail("sinan@pitstop.com")).thenReturn(Optional.of(testUser));
        when(clientMapper.mapToDTO(testClient)).thenReturn(testDTO);

        ClientDTO request = ClientDTO.builder()
                .firstname("Sinan Refactored")
                .lastname("Bou Refactored")
                .phoneNumber("999888777")
                .address("Calle Pitstop 2")
                .build();

        ClientDTO result = clientProfileService.updateProfile("sinan@pitstop.com", request);

        assertNotNull(result);
        verify(userRepository, times(1)).save(testUser);
        verify(clientRepository, times(1)).save(testClient);
        assertEquals("Sinan Refactored", testUser.getFirstname());
        assertEquals("Bou Refactored", testUser.getLastname());
        assertEquals("999888777", testClient.getPhoneNumber());
        assertEquals("Calle Pitstop 2", testClient.getAddress());
    }
}
