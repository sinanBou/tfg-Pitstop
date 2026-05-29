package org.tfg.backend.employee;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeAdminServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private WorkshopRepository workshopRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @InjectMocks
    private EmployeeAdminService employeeAdminService;

    private UUID workshopId;
    private Workshop testWorkshop;
    private Employee testOwner;
    private Employee testEmployee;
    private User testUser;

    @BeforeEach
    void setUp() {
        workshopId = UUID.randomUUID();

        testUser = User.builder()
                .firstname("Employee")
                .lastname("One")
                .email("emp.one@pitstop.com")
                .role(Role.WORKSHOP_STAFF)
                .build();

        testWorkshop = Workshop.builder()
                .id(workshopId)
                .companyName("Pitstop Workshop")
                .build();

        testOwner = Employee.builder()
                .id(UUID.randomUUID())
                .user(User.builder().firstname("Owner").lastname("Boss").email("owner@pitstop.com").role(Role.WORKSHOP_OWNER).build())
                .build();

        testWorkshop.setOwner(testOwner);

        testEmployee = Employee.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .workshop(testWorkshop)
                .build();
    }

    @Test
    void getEmployeesByWorkshopId_ShouldReturnListIncludingOwner() {
        when(workshopRepository.findById(workshopId)).thenReturn(Optional.of(testWorkshop));
        when(employeeRepository.findAll()).thenReturn(List.of(testEmployee, testOwner));
        when(employeeMapper.mapToDTO(any(Employee.class))).thenReturn(new EmployeeDTO());

        List<EmployeeDTO> result = employeeAdminService.getEmployeesByWorkshopId(workshopId);

        assertNotNull(result);
        assertEquals(2, result.size()); // Should include both employee and owner
        verify(workshopRepository, times(1)).findById(workshopId);
        verify(employeeRepository, times(1)).findAll();
    }

    @Test
    void addEmployeeToWorkshop_ShouldSaveUserAndEmployee() {
        AddEmployeeRequest request = AddEmployeeRequest.builder()
                .firstname("New")
                .lastname("Mechanic")
                .email("new.mech@pitstop.com")
                .password("plain")
                .role(Role.WORKSHOP_STAFF)
                .address("Calle 456")
                .build();

        when(userRepository.existsByEmail("new.mech@pitstop.com")).thenReturn(false);
        when(workshopRepository.findById(workshopId)).thenReturn(Optional.of(testWorkshop));
        when(passwordEncoder.encode("plain")).thenReturn("encoded");

        employeeAdminService.addEmployeeToWorkshop(workshopId, request);

        verify(userRepository, times(1)).existsByEmail("new.mech@pitstop.com");
        verify(userRepository, times(1)).save(any(User.class));
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void addEmployeeToWorkshop_ShouldThrowExceptionWhenEmailExists() {
        AddEmployeeRequest request = AddEmployeeRequest.builder().email("exists@pitstop.com").build();
        when(userRepository.existsByEmail("exists@pitstop.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> employeeAdminService.addEmployeeToWorkshop(workshopId, request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteEmployee_ShouldNullifyAppointmentsAndClearDb() {
        UUID employeeId = testEmployee.getId();
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(testEmployee));
        
        List<Appointment> apps = new ArrayList<>();
        Appointment app = new Appointment();
        app.setAssignedEmployee(testEmployee);
        apps.add(app);

        when(appointmentRepository.findByAssignedEmployeeId(employeeId)).thenReturn(apps);

        employeeAdminService.deleteEmployee(employeeId);

        assertNull(app.getAssignedEmployee());
        verify(appointmentRepository, times(1)).saveAll(apps);
        verify(employeeRepository, times(1)).delete(testEmployee);
        verify(userRepository, times(1)).delete(testUser);
    }

    @Test
    void promoteToManager_ShouldUpdateRole() {
        UUID employeeId = testEmployee.getId();
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(testEmployee));

        employeeAdminService.promoteToManager(employeeId);

        assertEquals(Role.WORKSHOP_MANAGER, testUser.getRole());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void demoteToStaff_ShouldUpdateRole() {
        testUser.setRole(Role.WORKSHOP_MANAGER);
        UUID employeeId = testEmployee.getId();
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(testEmployee));

        employeeAdminService.demoteToStaff(employeeId);

        assertEquals(Role.WORKSHOP_STAFF, testUser.getRole());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateAllowedSections_ShouldUpdateFields() {
        UUID employeeId = testEmployee.getId();
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(testEmployee));

        employeeAdminService.updateAllowedSections(employeeId, "PLANNING,TASKS");

        assertEquals("PLANNING,TASKS", testEmployee.getAllowedSections());
        verify(employeeRepository, times(1)).save(testEmployee);
    }
}
