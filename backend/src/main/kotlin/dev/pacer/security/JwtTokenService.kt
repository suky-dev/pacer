package dev.pacer.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class JwtTokenService(
    private val jwtEncoder: JwtEncoder,
    @Value("\${app.jwt.expiry-hours}") private val expiryHours: Long,
) {
    fun mint(userId: UUID, email: String): String {
        val now = Instant.now()
        val claims = JwtClaimsSet.builder()
            .subject(userId.toString())
            .claim("email", email)
            .issuedAt(now)
            .expiresAt(now.plusSeconds(expiryHours * 3600))
            .build()
        val header = JwsHeader.with { "HS256" }.build()
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).tokenValue
    }
}
