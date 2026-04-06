package dev.pacer.domain.user

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("local")
class UserRepositoryTest {

    @Autowired
    lateinit var userRepository: UserRepository

    @Test
    fun `findByGoogleId returns user when found`() {
        val user = User(
            googleId = "google-123",
            email = "test@example.com",
            name = "Test User",
        )
        userRepository.save(user)

        val found = userRepository.findByGoogleId("google-123")

        assertNotNull(found)
        assertEquals("google-123", found.googleId)
        assertEquals("test@example.com", found.email)
        assertEquals("Test User", found.name)
    }

    @Test
    fun `findByGoogleId returns null when not found`() {
        val found = userRepository.findByGoogleId("unknown-google-id")

        assertNull(found)
    }
}
