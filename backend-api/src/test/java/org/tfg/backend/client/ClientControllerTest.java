package org.tfg.backend.client;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ClientControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClientProfileService clientProfileService;

    @Mock
    private ClientAdminService clientAdminService;

    @InjectMocks
    private ClientController clientController;

    private User mockAuthUser;
    private ClientDTO mockDTO;
    private ClientSearchDTO mockSearchDTO;

    @BeforeEach
    void setUp() {
        mockAuthUser = User.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .role(Role.CLIENT)
                .build();

        mockDTO = ClientDTO.builder()
                .id(UUID.randomUUID())
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .nif("12345678A")
                .phoneNumber("666777888")
                .address("Calle Pitstop 1")
                .build();

        mockSearchDTO = ClientSearchDTO.builder()
                .id(UUID.randomUUID())
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .nif("12345678A")
                .phoneNumber("666777888")
                .build();

        HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return mockAuthUser;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(clientController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .build();
    }

    @Test
    void getMe_ShouldReturnProfile() throws Exception {
        when(clientProfileService.getClientProfile("sinan@pitstop.com")).thenReturn(mockDTO);

        mockMvc.perform(get("/api/clients/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("sinan@pitstop.com")))
                .andExpect(jsonPath("$.nif", is("12345678A")));

        verify(clientProfileService, times(1)).getClientProfile("sinan@pitstop.com");
    }

    @Test
    void updateMe_ShouldReturnUpdatedProfile() throws Exception {
        when(clientProfileService.updateProfile(eq("sinan@pitstop.com"), any(ClientDTO.class)))
                .thenReturn(mockDTO);

        String payload = "{\"firstname\":\"Sinan Refactored\",\"phoneNumber\":\"999888777\"}";

        mockMvc.perform(put("/api/clients/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("sinan@pitstop.com")));

        verify(clientProfileService, times(1)).updateProfile(eq("sinan@pitstop.com"), any(ClientDTO.class));
    }

    @Test
    void search_ShouldReturnPaginatedClients() throws Exception {
        Page<ClientSearchDTO> pagedResult = new PageImpl<>(List.of(mockSearchDTO), org.springframework.data.domain.PageRequest.of(0, 10), 1);
        when(clientAdminService.searchClientsPaginated("Sinan", 0, 10)).thenReturn(pagedResult);

        mockMvc.perform(get("/api/clients/search")
                        .param("query", "Sinan")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].email", is("sinan@pitstop.com")));

        verify(clientAdminService, times(1)).searchClientsPaginated("Sinan", 0, 10);
    }

    @Test
    void manualRegister_ShouldReturnRegisteredClient() throws Exception {
        when(clientAdminService.registerManualClient(any(ClientSearchDTO.class))).thenReturn(mockSearchDTO);

        String payload = "{\"firstname\":\"Sinan\",\"lastname\":\"Bou\",\"email\":\"sinan@pitstop.com\",\"nif\":\"12345678A\"}";

        mockMvc.perform(post("/api/clients/manual-register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("sinan@pitstop.com")));

        verify(clientAdminService, times(1)).registerManualClient(any(ClientSearchDTO.class));
    }
}
