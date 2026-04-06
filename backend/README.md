# Pacer — Backend

Kotlin + Spring Boot 4.0.3 API server.

## Environments

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8080` |
| Staging | `https://pacer-staging.up.railway.app` |
| Production | TBD (Railway) |

## Requirements

- Java 21
- PostgreSQL (local: `localhost:5432/pacer`)

## Setup

Copy the local properties file (gitignored):

```bash
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
# then fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET
```

> The example file doesn't exist yet — use the values from a teammate or create the file with:
> ```properties
> spring.datasource.url=jdbc:postgresql://localhost:5432/pacer
> spring.datasource.username=postgres
> spring.datasource.password=
> spring.jpa.show-sql=true
> spring.flyway.enabled=true
> GOOGLE_CLIENT_ID=your-google-client-id
> GOOGLE_CLIENT_SECRET=your-google-client-secret
> JWT_SECRET=local-dev-secret-min-32-chars-long!!
> FRONTEND_URL=http://localhost:3000
> ```

## Run

```bash
./gradlew bootRun
```

Server starts on `http://localhost:8080`.

## Test

```bash
./gradlew test
```

Tests use the real local PostgreSQL (no Docker/Testcontainers). Make sure the DB is running before testing.

## Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/oauth2/authorization/google` | Initiate Google OAuth |
| GET | `/api/users/me` | Current user (JWT required) |
| PATCH | `/api/users/me/cv-template` | Save CV template Doc URL |

## Domain structure

```
domain/
  user/           — User entity, auth, CV template URL
  searchprofile/  — Job search profile (keywords, location, etc.)
security/
  JwtConfig       — JwtEncoder/JwtDecoder beans (HS256)
  JwtTokenService — Mint JWTs
  SecurityConfig  — Spring Security filter chain
  OAuth2SuccessHandler — Google OAuth callback → JWT → FE redirect
```

## Google Cloud Console (required for OAuth)

1. Enable Google Docs API + Google Drive API
2. OAuth consent screen: add scopes `openid`, `email`, `profile`, `documents`, `drive.file`
3. Create OAuth 2.0 Client ID (Web) with:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:8080/login/oauth2/code/google`
4. Copy Client ID + Secret to `application-local.properties`

## Production deployment checklist (Railway)

- [ ] Add Railway environment variables:
  ```
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  JWT_SECRET=<strong random value>
  FRONTEND_URL=https://your-app.vercel.app
  ```
- [ ] Add to Google Cloud Console OAuth Client:
  - **Authorized JavaScript origins:** `https://your-app.vercel.app`
  - **Authorized redirect URIs:** `https://pacer-staging.up.railway.app/login/oauth2/code/google`
