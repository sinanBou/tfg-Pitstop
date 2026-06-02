package org.tfg.backend.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.tfg.backend.auth.AuthResponse;
import org.tfg.backend.auth.LoginRequest;
import org.tfg.backend.auth.RegisterRequest;
import org.tfg.backend.vehicle.VehicleRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.User;

@SpringBootTest
class VehicleIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void endToEnd_VehicleLifecycleFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String clientEmail = "client." + randomSuffix + "@pitstop.com";
        String licensePlate = "E" + randomSuffix.toUpperCase();

        // 1. Registrar un Cliente
        RegisterRequest registerClient = RegisterRequest.builder()
                .firstname("ClientName")
                .lastname("ClientLastname")
                .email(clientEmail)
                .password("clientPassword123")
                .nif("NIF" + randomSuffix.toUpperCase())
                .phoneNumber("600111222")
                .address("Calle Vehículo 5")
                .build();

        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerClient)))
                .andExpect(status().isOk());

        // Verificar el cliente en la BD para poder loguear
        User user = userRepository.findByEmail(clientEmail).orElseThrow();
        user.setVerified(true);
        userRepository.save(user);

        // 2. Login del Cliente
        LoginRequest loginRequest = new LoginRequest(clientEmail, "clientPassword123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String authResponseString = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(authResponseString, AuthResponse.class);
        String jwtToken = authResponse.getToken();
        assertNotNull(jwtToken);

        // 3. Consultar marcas de catálogo de vehículos
        mockMvc.perform(get("/api/vehicles/catalog/makes")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));

        // 4. Registrar un Vehículo
        VehicleRequest vehicleRequest = new VehicleRequest();
        vehicleRequest.setBrand("Toyota");
        vehicleRequest.setModel("Corolla");
        vehicleRequest.setLicensePlate(licensePlate);
        vehicleRequest.setVin("VIN-" + randomSuffix.toUpperCase());
        vehicleRequest.setYear(2022);
        vehicleRequest.setColor("Rojo");

        MvcResult registerVehicleResult = mockMvc.perform(post("/api/vehicles/register")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.brand", is("Toyota")))
                .andExpect(jsonPath("$.model", is("Corolla")))
                .andExpect(jsonPath("$.licensePlate", is(licensePlate)))
                .andReturn();

        String vehicleResponseString = registerVehicleResult.getResponse().getContentAsString();
        Map<String, Object> vehicleMap = objectMapper.readValue(vehicleResponseString, new TypeReference<Map<String, Object>>() {});
        UUID vehicleId = UUID.fromString((String) vehicleMap.get("id"));

        // 5. Consultar los vehículos propios del Cliente
        MvcResult myVehiclesResult = mockMvc.perform(get("/api/vehicles/my-vehicles")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        String myVehiclesString = myVehiclesResult.getResponse().getContentAsString();
        List<Map<String, Object>> vehiclesList = objectMapper.readValue(myVehiclesString, new TypeReference<List<Map<String, Object>>>() {});
        boolean foundCreatedVehicle = vehiclesList.stream()
                .anyMatch(v -> v.get("id").equals(vehicleId.toString()));
        assertTrue(foundCreatedVehicle, "El vehículo creado debería estar en la lista de vehículos propios del cliente.");

        // 6. Eliminar el vehículo creado
        mockMvc.perform(delete("/api/vehicles/" + vehicleId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        // 7. Verificar que el vehículo ha sido eliminado
        MvcResult myVehiclesAfterDeleteResult = mockMvc.perform(get("/api/vehicles/my-vehicles")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn();

        String myVehiclesAfterDeleteString = myVehiclesAfterDeleteResult.getResponse().getContentAsString();
        List<Map<String, Object>> vehiclesListAfterDelete = objectMapper.readValue(myVehiclesAfterDeleteString, new TypeReference<List<Map<String, Object>>>() {});
        boolean foundCreatedVehicleAfterDelete = vehiclesListAfterDelete.stream()
                .anyMatch(v -> v.get("id").equals(vehicleId.toString()));
        assertFalse(foundCreatedVehicleAfterDelete, "El vehículo eliminado ya no debería estar en la lista.");
    }
}
