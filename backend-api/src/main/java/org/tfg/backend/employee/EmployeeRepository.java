package org.tfg.backend.employee;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Repositorio de persistencia para la entidad {@link Employee}.
 * Proporciona operaciones básicas de acceso a datos heredadas de {@link JpaRepository}.
 */
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
}