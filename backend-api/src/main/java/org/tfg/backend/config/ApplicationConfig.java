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
 * Configuración general de la aplicación, definiendo beans de infraestructura clave
 * para la seguridad y el procesamiento de datos, tales como el UserDetailsService,
 * el proveedor de autenticación y los codificadores de contraseñas.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    /**
     * Define el bean UserDetailsService encargado de recuperar los detalles del usuario
     * a partir de su dirección de correo electrónico de forma segura e insensible a mayúsculas.
     *
     * @return El servicio UserDetailsService configurado.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username != null ? username.trim().toLowerCase() : "")
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    /**
     * Define el proveedor de autenticación estándar basado en base de datos.
     *
     * @return El AuthenticationProvider configurado.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Bean del manejador de autenticación encargado de orquestar el flujo de credenciales.
     *
     * @param config Configuración de autenticación.
     * @return El AuthenticationManager.
     * @throws Exception Si ocurre un fallo en la inicialización.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Define el codificador de contraseñas utilizando el algoritmo fuerte BCrypt.
     *
     * @return Instancia de PasswordEncoder.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Bean del mapeador de objetos JSON ObjectMapper para serialización y deserialización.
     *
     * @return El ObjectMapper configurado.
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}