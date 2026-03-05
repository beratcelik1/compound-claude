# Security Rules

## Secrets & Credentials
- NEVER hardcode secrets, API keys, passwords, or tokens
- NEVER commit .env files, credentials.json, or private keys
- Use environment variables for all sensitive configuration
- If you see a secret in code, immediately flag it and remove it

## Input Validation
- Validate ALL user input at system boundaries
- Sanitize data before database queries (prevent SQL injection)
- Escape output in templates (prevent XSS)
- Use parameterized queries, never string concatenation

## Authentication & Authorization
- Never store passwords in plaintext
- Check authorization on every protected endpoint
- Use secure session management
- Implement proper CORS policies

## When to Escalate
- If you find credentials in code → warn user immediately
- If you're unsure about security implications → ask before proceeding
- If implementing auth/crypto → use battle-tested libraries, don't roll your own
