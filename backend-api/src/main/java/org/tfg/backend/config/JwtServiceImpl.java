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
 * Implementación concreta del servicio {@link JwtService} utilizando la biblioteca jjwt (Json Web Token para Java).
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
     * Genera un token JWT firmado digitalmente con validez de 24 horas.
     *
     * @param username Identificador único de usuario (email).
     * @return Token JWT firmado.
     */
    @Override
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
     * Resuelve un 'claim' o propiedad específica del token mediante una función de extracción.
     *
     * @param token Token JWT.
     * @param claimsResolver Función resolutora de claims.
     * @param <T> Tipo de dato del claim extraído.
     * @return Valor del claim resuelto.
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
     * Comprueba si el token ha superado la fecha de expiración.
     *
     * @param token Token JWT.
     * @return true si ha expirado, false en caso contrario.
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
     * Valida si el token JWT pertenece al usuario autenticado y sigue estando vigente.
     *
     * @param token Token JWT.
     * @param userDetails Detalles de identidad del usuario.
     * @return true si es válido y vigente, false en caso contrario.
     */
    public Boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}