package dev.pacer.domain.user

import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class UserService(private val userRepository: UserRepository) {

    @Transactional
    fun findOrCreate(oidcUser: OidcUser, accessToken: String, refreshToken: String?): User {
        val googleId = oidcUser.subject
        val existing = userRepository.findByGoogleId(googleId)
        if (existing != null) {
            existing.googleAccessToken = accessToken
            if (refreshToken != null) existing.googleRefreshToken = refreshToken
            existing.updatedAt = Instant.now()
            return userRepository.save(existing)
        }
        return userRepository.save(
            User(
                googleId = googleId,
                email = oidcUser.email,
                name = oidcUser.fullName,
                googleAccessToken = accessToken,
                googleRefreshToken = refreshToken,
            )
        )
    }

    fun findById(userId: UUID): User =
        userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found: $userId") }

    @Transactional
    fun updateCvTemplateUrl(userId: UUID, url: String): User {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found: $userId") }
        user.cvTemplateUrl = url
        user.updatedAt = Instant.now()
        return userRepository.save(user)
    }
}
