package org.tfg.backend.vehicle;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

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
class VehicleControllerTest {

    private MockMvc mockMvc;

    @Mock
    private VehicleProfileService vehicleProfileService;

    @Mock
    private VehicleAdminService vehicleAdminService;

    @Mock
    private VehicleCatalogService catalogService;

    @InjectMocks
    private VehicleController vehicleController;

    private UserDetails mockUserDetails;
    private VehicleDTO mockDTO;
    private VehicleSearchDTO mockSearchDTO;

    @BeforeEach
    void setUp() {
        mockUserDetails = org.springframework.security.core.userdetails.User.withUsername("john@pitstop.com")
                .password("password")
                .roles("CLIENT")
                .build();

        mockDTO = VehicleDTO.builder()
                .id(UUID.randomUUID())
                .brand("BMW")
                .model("M3")
                .licensePlate("1234BBB")
                .year(2022)
                .vin("VIN123456789")
                .status("EN_CASA")
                .build();

        mockSearchDTO = VehicleSearchDTO.builder()
                .id(mockDTO.getId())
                .brand("BMW")
                .model("M3")
                .licensePlate("1234BBB")
                .clientId(UUID.randomUUID())
                .build();

        HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                           NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return mockUserDetails;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(vehicleController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .build();
    }

    @Test
    void getCatalogMakes_ShouldReturnList() throws Exception {
        when(catalogService.getMakes()).thenReturn(List.of("BMW", "Audi"));

        mockMvc.perform(get("/api/vehicles/catalog/makes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0]", is("BMW")));

        verify(catalogService, times(1)).getMakes();
    }

    @Test
    void getCatalogModels_ShouldReturnList() throws Exception {
        when(catalogService.getModels("BMW")).thenReturn(List.of("M3", "M4"));

        mockMvc.perform(get("/api/vehicles/catalog/models/BMW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0]", is("M3")));

        verify(catalogService, times(1)).getModels("BMW");
    }

    @Test
    void register_ShouldReturnDTO() throws Exception {
        when(vehicleProfileService.registerVehicle(any(VehicleRequest.class), eq("john@pitstop.com")))
                .thenReturn(mockDTO);

        String payload = "{\"brand\":\"BMW\",\"model\":\"M3\",\"licensePlate\":\"1234BBB\",\"year\":2022,\"vin\":\"VIN123456789\"}";

        mockMvc.perform(post("/api/vehicles/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand", is("BMW")));

        verify(vehicleProfileService, times(1)).registerVehicle(any(VehicleRequest.class), eq("john@pitstop.com"));
    }

    @Test
    void getMyVehicles_ShouldReturnList() throws Exception {
        when(vehicleProfileService.getVehiclesByClient("john@pitstop.com")).thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/vehicles/my-vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].brand", is("BMW")));

        verify(vehicleProfileService, times(1)).getVehiclesByClient("john@pitstop.com");
    }

    @Test
    void search_ShouldReturnList() throws Exception {
        when(vehicleAdminService.searchVehicles("1234BBB")).thenReturn(List.of(mockSearchDTO));

        mockMvc.perform(get("/api/vehicles/search")
                        .param("licensePlate", "1234BBB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].brand", is("BMW")));

        verify(vehicleAdminService, times(1)).searchVehicles("1234BBB");
    }

    @Test
    void getVehiclesByClientId_ShouldReturnList() throws Exception {
        UUID clientId = mockSearchDTO.getClientId();
        when(vehicleAdminService.getVehiclesByClientId(clientId)).thenReturn(List.of(mockSearchDTO));

        mockMvc.perform(get("/api/vehicles/client/{clientId}", clientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].brand", is("BMW")));

        verify(vehicleAdminService, times(1)).getVehiclesByClientId(clientId);
    }

    @Test
    void registerForClient_ShouldReturnSearchDTO() throws Exception {
        UUID clientId = mockSearchDTO.getClientId();
        when(vehicleAdminService.registerVehicleForClient(eq(clientId), any(VehicleRequest.class)))
                .thenReturn(mockSearchDTO);

        String payload = "{\"brand\":\"BMW\",\"model\":\"M3\",\"licensePlate\":\"1234BBB\",\"year\":2022,\"vin\":\"VIN123456789\"}";

        mockMvc.perform(post("/api/vehicles/register-for-client/{clientId}", clientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand", is("BMW")));

        verify(vehicleAdminService, times(1)).registerVehicleForClient(eq(clientId), any(VehicleRequest.class));
    }

    @Test
    void deleteVehicle_ShouldReturnNoContent() throws Exception {
        UUID vehicleId = mockDTO.getId();
        doNothing().when(vehicleProfileService).deleteVehicle(vehicleId, "john@pitstop.com");

        mockMvc.perform(delete("/api/vehicles/{id}", vehicleId))
                .andExpect(status().isNoContent());

        verify(vehicleProfileService, times(1)).deleteVehicle(vehicleId, "john@pitstop.com");
    }
}
