package org.tfg.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

/**
 * Implementación concreta del servicio {@link JwtService} para la emisión, parseo y validación de tokens JSON Web Tokens (JWT).
 * Utiliza claves HMAC-SHA para garantizar la autenticidad e integridad de las firmas de los tokens.
 */
@Service
public class JwtServiceImpl implements JwtService {
    @Value("${jwt.secret}")
    private String secretKey;

    /**
     * Obtiene la clave secreta formateada para la firma y cifrado del token JWT.
     *
     * @return La instancia de {@link Key}.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /**
     * Genera un token JWT para el nombre de usuario (email) especificado, con una duración de 24 horas.
     *
     * @param username Identificador o email del usuario.
     * @return Token JWT serializado.
     */
    public String generarToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrae el email/username encapsulado dentro del token.
     *
     * @param token Token JWT.
     * @return Nombre de usuario.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrae una propiedad (claim) específica del token utilizando un resolvedor de funciones.
     *
     * @param <T> Tipo del valor de la propiedad.
     * @param token Token JWT.
     * @param claimsResolver Función resolvedora.
     * @return El valor de la propiedad.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrae todas las propiedades (claims) del cuerpo del token JWT.
     *
     * @param token Token JWT.
     * @return Instancia de {@link Claims}.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    /**
     * Comprueba si el token JWT ha superado su fecha de expiración.
     *
     * @param token Token JWT.
     * @return True si ha expirado, False en caso contrario.
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extrae la fecha de expiración configurada en el token.
     *
     * @param token Token JWT.
     * @return Fecha de expiración.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Valida que el token JWT pertenezca al usuario indicado en el UserDetails y que no haya expirado.
     *
     * @param token Token JWT a validar.
     * @param userDetails Detalles del usuario para contraste.
     * @return True si el token es válido, False de lo contrario.
     */
    public Boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}