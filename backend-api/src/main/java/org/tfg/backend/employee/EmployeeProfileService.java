package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.tfg.backend.storage.StorageService;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class EmployeeProfileService {

    private final UserRepository userRepository;
    private final StorageService storageService;
    private final EmployeeMapper employeeMapper;

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Employee employee = user.getEmployee();
        if (employee == null) {
            throw new RuntimeException("El usuario no tiene un perfil de empleado");
        }

        return employeeMapper.mapToDTO(employee);
    }

    @Transactional
    public EmployeeDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (request.getFirstname() != null && !request.getFirstname().isBlank()) {
            user.setFirstname(request.getFirstname().trim());
        }
        if (request.getLastname() != null && !request.getLastname().isBlank()) {
            user.setLastname(request.getLastname().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        userRepository.save(user);

        Employee employee = user.getEmployee();
        if (employee != null) {
            if (request.getNif() != null) {
                employee.setNif(request.getNif().trim());
            }
            if (request.getPhoneNumber() != null) {
                employee.setPhoneNumber(request.getPhoneNumber().trim());
            }
            if (request.getAddress() != null) {
                employee.setAddress(request.getAddress().trim());
            }
        }

        return employeeMapper.mapToDTO(employee);
    }

    @Transactional
    public EmployeeDTO uploadProfilePicture(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getProfilePictureUrl() != null) {
            storageService.deleteFile(user.getProfilePictureUrl());
        }

        String fileUrl = storageService.uploadFile(file, "profile-pictures");
        user.setProfilePictureUrl(fileUrl);
        userRepository.save(user);

        return employeeMapper.mapToDTO(user.getEmployee());
    }

    @Transactional
    public EmployeeDTO deleteProfilePicture(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getProfilePictureUrl() != null) {
            storageService.deleteFile(user.getProfilePictureUrl());
            user.setProfilePictureUrl(null);
            userRepository.save(user);
        }

        return employeeMapper.mapToDTO(user.getEmployee());
    }
}
