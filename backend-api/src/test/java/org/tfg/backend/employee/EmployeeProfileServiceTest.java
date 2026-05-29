package org.tfg.backend.employee;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import org.tfg.backend.storage.StorageService;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private EmployeeMapper employeeMapper;

    @InjectMocks
    private EmployeeProfileService employeeProfileService;

    private User testUser;
    private Employee testEmployee;
    private EmployeeDTO testDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@pitstop.com")
                .address("Calle Principal 1")
                .profilePictureUrl("old-picture-url")
                .build();

        testEmployee = Employee.builder()
                .user(testUser)
                .build();

        testUser.setEmployee(testEmployee);

        testDTO = EmployeeDTO.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@pitstop.com")
                .address("Calle Principal 1")
                .profilePictureUrl("old-picture-presigned")
                .build();
    }

    @Test
    void getEmployeeProfile_ShouldReturnDTO() {
        when(userRepository.findByEmail("john.doe@pitstop.com")).thenReturn(Optional.of(testUser));
        when(employeeMapper.mapToDTO(testEmployee)).thenReturn(testDTO);

        EmployeeDTO result = employeeProfileService.getEmployeeProfile("john.doe@pitstop.com");

        assertNotNull(result);
        assertEquals("john.doe@pitstop.com", result.getEmail());
        verify(userRepository, times(1)).findByEmail("john.doe@pitstop.com");
        verify(employeeMapper, times(1)).mapToDTO(testEmployee);
    }

    @Test
    void getEmployeeProfile_ShouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("john.doe@pitstop.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> employeeProfileService.getEmployeeProfile("john.doe@pitstop.com"));
        verify(userRepository, times(1)).findByEmail("john.doe@pitstop.com");
    }

    @Test
    void getEmployeeProfile_ShouldThrowExceptionWhenNotEmployee() {
        testUser.setEmployee(null);
        when(userRepository.findByEmail("john.doe@pitstop.com")).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> employeeProfileService.getEmployeeProfile("john.doe@pitstop.com"));
    }

    @Test
    void updateProfile_ShouldUpdateFieldsAndReturnDTO() {
        when(userRepository.findByEmail("john.doe@pitstop.com")).thenReturn(Optional.of(testUser));
        when(employeeMapper.mapToDTO(testEmployee)).thenReturn(testDTO);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstname("Jane");
        request.setLastname("Smith");
        request.setAddress("Nueva Calle 2");

        EmployeeDTO result = employeeProfileService.updateProfile("john.doe@pitstop.com", request);

        assertNotNull(result);
        verify(userRepository, times(1)).findByEmail("john.doe@pitstop.com");
        verify(userRepository, times(1)).save(testUser);
        assertEquals("Jane", testUser.getFirstname());
        assertEquals("Smith", testUser.getLastname());
        assertEquals("Nueva Calle 2", testUser.getAddress());
    }

    @Test
    void uploadProfilePicture_ShouldDeleteOldAndSaveNew() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(userRepository.findByEmail("john.doe@pitstop.com")).thenReturn(Optional.of(testUser));
        when(storageService.uploadFile(mockFile, "profile-pictures")).thenReturn("new-picture-url");
        when(employeeMapper.mapToDTO(testEmployee)).thenReturn(testDTO);

        EmployeeDTO result = employeeProfileService.uploadProfilePicture("john.doe@pitstop.com", mockFile);

        assertNotNull(result);
        verify(storageService, times(1)).deleteFile("old-picture-url");
        verify(storageService, times(1)).uploadFile(mockFile, "profile-pictures");
        verify(userRepository, times(1)).save(testUser);
        assertEquals("new-picture-url", testUser.getProfilePictureUrl());
    }

    @Test
    void deleteProfilePicture_ShouldDeleteAndClearUrl() {
        when(userRepository.findByEmail("john.doe@pitstop.com")).thenReturn(Optional.of(testUser));
        when(employeeMapper.mapToDTO(testEmployee)).thenReturn(testDTO);

        EmployeeDTO result = employeeProfileService.deleteProfilePicture("john.doe@pitstop.com");

        assertNotNull(result);
        verify(storageService, times(1)).deleteFile("old-picture-url");
        verify(userRepository, times(1)).save(testUser);
        assertNull(testUser.getProfilePictureUrl());
    }
}
