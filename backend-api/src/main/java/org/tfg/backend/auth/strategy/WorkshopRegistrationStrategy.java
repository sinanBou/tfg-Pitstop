package org.tfg.backend.auth.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.auth.RegisterRequest;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.user.User;
import org.tfg.backend.user.Role;

@Component
@RequiredArgsConstructor
public class WorkshopRegistrationStrategy implements RegistrationStrategy {

    private final EmployeeRepository employeeRepository;

    @Override
    public void register(RegisterRequest request, User user) {
        Employee ownerEmployee = Employee.builder()
                .user(user)
                .nif(request.getNif())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .build();
        employeeRepository.save(ownerEmployee);
    }

    @Override
    public boolean supports(Role role) {
        return role == Role.WORKSHOP_OWNER;
    }
}
