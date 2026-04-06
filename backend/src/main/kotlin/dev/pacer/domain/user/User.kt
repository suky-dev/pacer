package dev.pacer.domain.user

import jakarta.persistence.*
import org.hibernate.annotations.UuidGenerator
import java.time.Instant
import java.util.*

// TODO: encrypt googleAccessToken and googleRefreshToken at rest for production
@Entity
@Table(name = "users")
class User(
    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    @GeneratedValue
    val id: UUID? = null,

    @Column(name = "google_id", nullable = false, unique = true)
    var googleId: String,

    @Column(nullable = false, unique = true)
    var email: String,

    @Column
    var name: String? = null,

    @Column(name = "google_access_token", columnDefinition = "TEXT")
    var googleAccessToken: String? = null,

    @Column(name = "google_refresh_token", columnDefinition = "TEXT")
    var googleRefreshToken: String? = null,

    @Column(name = "cv_template_url", columnDefinition = "TEXT")
    var cvTemplateUrl: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
