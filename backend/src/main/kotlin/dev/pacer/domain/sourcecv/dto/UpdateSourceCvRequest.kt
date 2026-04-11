package dev.pacer.domain.sourcecv.dto

import tools.jackson.databind.JsonNode

data class UpdateSourceCvRequest(
    val data: JsonNode,
)
