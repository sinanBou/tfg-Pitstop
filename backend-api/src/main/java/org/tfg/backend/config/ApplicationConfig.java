package org.tfg.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.tfg.backend.user.UserRepository;

/**
 * Clase de configuración global de Spring Boot para definir Beans esenciales del sistema,
 * como la encriptación de contraseñas, componentes de autenticación de seguridad y el mapeador de JSON ObjectMapper.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    /**
     * Define el cargador de detalles del usuario utilizado por Spring Security para autenticar credenciales.
     * Busca al usuario en base de datos utilizando el email normalizado (limpio y en minúsculas).
     *
     * @return Implementación funcional de {@link UserDetailsService}.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username != null ? username.trim().toLowerCase() : "")
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    /**
     * Define el proveedor de autenticación estándar de tipo DAO.
     * Vincula el servicio de carga de usuarios y el codificador de contraseñas.
     *
     * @return El bean de {@link AuthenticationProvider}.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Proporciona acceso al gestor de autenticación oficial de Spring Security.
     *
     * @param config Configuración de autenticación de Spring.
     * @return Instancia del gestor {@link AuthenticationManager}.
     * @throws Exception en caso de errores en la recuperación del gestor.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Define el codificador de contraseñas basado en el algoritmo fuerte BCrypt.
     *
     * @return Instancia de {@link PasswordEncoder}.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Define el bean de Jackson ObjectMapper para la serialización y deserialización de datos JSON.
     *
     * @return Instancia global de {@link ObjectMapper}.
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}