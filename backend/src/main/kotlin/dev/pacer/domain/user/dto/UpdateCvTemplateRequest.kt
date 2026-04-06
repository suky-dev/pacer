package dev.pacer.domain.user.dto

import jakarta.validation.constraints.NotBlank

data class UpdateCvTemplateRequest(
    @field:NotBlank val cvTemplateUrl: String,
)
