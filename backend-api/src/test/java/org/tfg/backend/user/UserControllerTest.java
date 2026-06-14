package org.tfg.backend.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private org.tfg.backend.user.service.UserLookupService userLookupService;

    @Mock
    private org.tfg.backend.user.service.UserAdminService userAdminService;

    @InjectMocks
    private UserController userController;

    private UserDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockDTO = UserDTO.builder()
                .id(UUID.randomUUID())
                .firstname("John")
                .lastname("Doe")
                .email("john@example.com")
                .role("CLIENT")
                .build();

        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterType().equals(UserDetails.class);
                    }

                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                   NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return org.springframework.security.core.userdetails.User.withUsername("john@example.com")
                                .password("password")
                                .roles("CLIENT")
                                .build();
                    }
                })
                .build();
    }

    @Test
    void getMe_ShouldReturnUserDetails() throws Exception {
        when(userLookupService.getUserDetails("john@example.com")).thenReturn(mockDTO);

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("john@example.com")))
                .andExpect(jsonPath("$.firstname", is("John")))
                .andExpect(jsonPath("$.role", is("CLIENT")));

        verify(userLookupService, times(1)).getUserDetails("john@example.com");
    }
}
