package dev.pacer.security

import dev.pacer.domain.user.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component

@Component
class OAuth2SuccessHandler(
    private val userService: UserService,
    private val jwtTokenService: JwtTokenService,
    private val authorizedClientService: OAuth2AuthorizedClientService,
    @Value("\${app.frontend-url}") private val frontendUrl: String,
) : SimpleUrlAuthenticationSuccessHandler() {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    ) {
        val oauthToken = authentication as OAuth2AuthenticationToken
        val oidcUser = oauthToken.principal as OidcUser

        val authorizedClient: OAuth2AuthorizedClient = authorizedClientService
            .loadAuthorizedClient(oauthToken.authorizedClientRegistrationId, oauthToken.name)

        val accessToken = authorizedClient.accessToken.tokenValue
        val refreshToken = authorizedClient.refreshToken?.tokenValue

        val user = userService.findOrCreate(oidcUser, accessToken, refreshToken)
        val jwt = jwtTokenService.mint(user.id!!, user.email)

        response.sendRedirect("$frontendUrl/auth/callback?token=$jwt")
    }
}
