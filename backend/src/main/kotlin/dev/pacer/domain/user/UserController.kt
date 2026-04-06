package dev.pacer.domain.user

import dev.pacer.domain.user.dto.UpdateCvTemplateRequest
import dev.pacer.domain.user.dto.UserResponse
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @GetMapping("/me")
    fun getMe(@AuthenticationPrincipal jwt: Jwt): UserResponse {
        val userId = UUID.fromString(jwt.subject)
        val user = userService.findById(userId)
        return UserResponse.from(user)
    }

    @PatchMapping("/me/cv-template")
    fun updateCvTemplate(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: UpdateCvTemplateRequest,
    ): UserResponse {
        val userId = UUID.fromString(jwt.subject)
        val user = userService.updateCvTemplateUrl(userId, request.cvTemplateUrl)
        return UserResponse.from(user)
    }
}
