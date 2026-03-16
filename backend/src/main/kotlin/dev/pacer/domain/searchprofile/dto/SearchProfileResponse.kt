package dev.pacer.domain.searchprofile.dto

import dev.pacer.domain.searchprofile.ExperienceLevel
import dev.pacer.domain.searchprofile.RemoteOption
import dev.pacer.domain.searchprofile.SearchProfile
import java.time.Instant
import java.util.UUID

data class SearchProfileResponse(
    val id: UUID?,
    val userId: String?,
    val name: String,
    val keywords: List<String>,
    val excludeKeywords: List<String>,
    val locations: List<String>,
    val remoteOptions: List<RemoteOption>,
    val experienceLevels: List<ExperienceLevel>,
    val timeframeDays: Int,
    val isActive: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(profile: SearchProfile) = SearchProfileResponse(
            id = profile.id,
            userId = profile.userId,
            name = profile.name,
            keywords = profile.keywords.toList(),
            excludeKeywords = profile.excludeKeywords.toList(),
            locations = profile.locations.toList(),
            remoteOptions = profile.remoteOptions.toList(),
            experienceLevels = profile.experienceLevels.toList(),
            timeframeDays = profile.timeframeDays,
            isActive = profile.isActive,
            createdAt = profile.createdAt,
            updatedAt = profile.updatedAt,
        )
    }
}
