package dev.pacer.domain.searchprofile.dto

import dev.pacer.domain.searchprofile.ExperienceLevel
import dev.pacer.domain.searchprofile.RemoteOption
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive

data class CreateSearchProfileRequest(
    @field:NotBlank
    val name: String,
    val keywords: List<String> = emptyList(),
    val excludeKeywords: List<String> = emptyList(),
    val locations: List<String> = emptyList(),
    val remoteOptions: List<RemoteOption> = emptyList(),
    val experienceLevels: List<ExperienceLevel> = emptyList(),
    @field:Positive
    val timeframeDays: Int = 1,
    val isActive: Boolean = true,
)
