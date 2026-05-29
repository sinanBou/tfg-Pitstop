package org.tfg.backend.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientAdminServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ClientMapper clientMapper;

    @InjectMocks
    private ClientAdminService clientAdminService;

    private Client testClient;
    private ClientSearchDTO testSearchDTO;

    @BeforeEach
    void setUp() {
        testClient = Client.builder()
                .user(User.builder().firstname("Sinan").lastname("Bou").email("sinan@pitstop.com").build())
                .nif("12345678A")
                .phoneNumber("666777888")
                .build();

        testSearchDTO = ClientSearchDTO.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .nif("12345678A")
                .phoneNumber("666777888")
                .build();
    }

    @Test
    void searchClientsPaginated_ShouldReturnPage() {
        Page<Client> clientPage = new PageImpl<>(List.of(testClient));
        when(clientRepository.searchClients("Sinan", PageRequest.of(0, 10))).thenReturn(clientPage);
        when(clientMapper.mapToSearchDTO(testClient)).thenReturn(testSearchDTO);

        Page<ClientSearchDTO> result = clientAdminService.searchClientsPaginated("Sinan", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("sinan@pitstop.com", result.getContent().get(0).getEmail());
        verify(clientRepository, times(1)).searchClients("Sinan", PageRequest.of(0, 10));
    }

    @Test
    void registerManualClient_ShouldSaveUserAndClient() {
        when(clientRepository.existsByNif("12345678A")).thenReturn(false);
        when(userRepository.existsByEmail("sinan@pitstop.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(clientMapper.mapToSearchDTO(any(Client.class))).thenReturn(testSearchDTO);

        ClientSearchDTO result = clientAdminService.registerManualClient(testSearchDTO);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    void registerManualClient_ShouldThrowExceptionWhenNifEmpty() {
        testSearchDTO.setNif("");
        assertThrows(RuntimeException.class, () -> clientAdminService.registerManualClient(testSearchDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerManualClient_ShouldThrowExceptionWhenNifExists() {
        when(clientRepository.existsByNif("12345678A")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> clientAdminService.registerManualClient(testSearchDTO));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerManualClient_ShouldThrowExceptionWhenEmailExists() {
        when(clientRepository.existsByNif("12345678A")).thenReturn(false);
        when(userRepository.existsByEmail("sinan@pitstop.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> clientAdminService.registerManualClient(testSearchDTO));
        verify(userRepository, never()).save(any(User.class));
    }
}
