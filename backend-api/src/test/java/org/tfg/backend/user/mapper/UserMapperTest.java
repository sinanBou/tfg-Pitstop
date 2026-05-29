package org.tfg.backend.user.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.tfg.backend.client.Client;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserDTO;
import org.tfg.backend.workshop.Workshop;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {

    private UserMapper userMapper;

    @BeforeEach
    void setUp() {
        userMapper = new UserMapper();
    }

    @Test
    void mapToDTO_ShouldReturnNullWhenUserIsNull() {
        assertNull(userMapper.mapToDTO(null));
    }

    @Test
    void mapToDTO_ShouldMapAllFieldsSecurely_WithClientProfile() {
        Client mockClient = Client.builder()
                .id(UUID.randomUUID())
                .build();

        User mockUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("John")
                .lastname("Doe")
                .email("john@example.com")
                .role(Role.CLIENT)
                .client(mockClient)
                .build();

        UserDTO result = userMapper.mapToDTO(mockUser);

        assertNotNull(result);
        assertEquals(mockUser.getId(), result.getId());
        assertEquals("John", result.getFirstname());
        assertEquals("Doe", result.getLastname());
        assertEquals("john@example.com", result.getEmail());
        assertEquals("CLIENT", result.getRole());
        assertEquals(mockClient.getId(), result.getClientId());
        assertNull(result.getEmployeeId());
        assertNull(result.getWorkshopId());
    }

    @Test
    void mapToDTO_ShouldMapAllFieldsSecurely_WithEmployeeProfile() {
        Workshop mockWorkshop = Workshop.builder()
                .id(UUID.randomUUID())
                .build();

        Employee mockEmployee = Employee.builder()
                .id(UUID.randomUUID())
                .workshop(mockWorkshop)
                .build();

        User mockUser = User.builder()
                .id(UUID.randomUUID())
                .firstname("Jane")
                .lastname("Smith")
                .email("jane@example.com")
                .role(Role.WORKSHOP_STAFF)
                .employee(mockEmployee)
                .build();

        UserDTO result = userMapper.mapToDTO(mockUser);

        assertNotNull(result);
        assertEquals(mockUser.getId(), result.getId());
        assertEquals("Jane", result.getFirstname());
        assertEquals("Smith", result.getLastname());
        assertEquals("jane@example.com", result.getEmail());
        assertEquals("WORKSHOP_STAFF", result.getRole());
        assertNull(result.getClientId());
        assertEquals(mockEmployee.getId(), result.getEmployeeId());
        assertEquals(mockWorkshop.getId(), result.getWorkshopId());
    }
}
