package dev.pacer.domain.searchprofile.dto

import dev.pacer.domain.searchprofile.ExperienceLevel
import dev.pacer.domain.searchprofile.RemoteOption
import jakarta.validation.constraints.Positive

data class UpdateSearchProfileRequest(
    val name: String? = null,
    val keywords: List<String>? = null,
    val excludeKeywords: List<String>? = null,
    val locations: List<String>? = null,
    val remoteOptions: List<RemoteOption>? = null,
    val experienceLevels: List<ExperienceLevel>? = null,
    @field:Positive
    val timeframeDays: Int? = null,
    val isActive: Boolean? = null,
)
