package dev.pacer.domain.user.dto

import dev.pacer.domain.user.User
import java.util.UUID

data class UserResponse(
    val id: UUID,
    val email: String,
    val name: String?,
    val cvTemplateUrl: String?,
) {
    companion object {
        fun from(user: User) = UserResponse(
            id = user.id!!,
            email = user.email,
            name = user.name,
            cvTemplateUrl = user.cvTemplateUrl,
        )
    }
}
