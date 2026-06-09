package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.tfg.backend.storage.StorageService;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.io.IOException;

/**
 * Servicio encargado de gestionar las operaciones de perfil del empleado autenticado,
 * incluyendo la consulta y actualización de sus datos personales y la gestión de la
 * imagen de perfil (avatar).
 */
@Service
@RequiredArgsConstructor
public class EmployeeProfileService {

    private final UserRepository userRepository;
    private final StorageService storageService;
    private final EmployeeMapper employeeMapper;

    /**
     * Obtiene el DTO de perfil del empleado correspondiente al correo electrónico provisto.
     *
     * @param email Correo electrónico del usuario/empleado.
     * @return DTO con la información detallada del perfil del empleado.
     * @throws RuntimeException Si el usuario no existe o no tiene perfil de empleado.
     */
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

    /**
     * Actualiza los datos editables y seguros del perfil de un empleado.
     *
     * @param email Correo electrónico del empleado.
     * @param request Petición con los nuevos valores del perfil (nombre, apellidos, dirección, NIF, teléfono).
     * @return DTO del empleado con la información actualizada.
     * @throws RuntimeException Si el usuario no existe.
     */
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

    /**
     * Sube y asocia una nueva imagen de perfil para el empleado.
     * Si existía una imagen anterior, la elimina del servicio de almacenamiento.
     *
     * @param email Correo electrónico del empleado.
     * @param file Archivo de imagen multimedia a subir.
     * @return DTO del empleado con la URL del nuevo avatar generada.
     * @throws IOException Si ocurre un error de lectura/escritura del archivo.
     * @throws RuntimeException Si el usuario no existe.
     */
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

    /**
     * Elimina la imagen de perfil actual de un empleado del sistema de almacenamiento
     * y borra su referencia en la base de datos.
     *
     * @param email Correo electrónico del empleado.
     * @return DTO del empleado con la referencia al avatar vacía.
     * @throws RuntimeException Si el usuario no existe.
     */
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
