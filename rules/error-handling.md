# Error Handling Rules

## Error Types
- Define specific error types for different failure categories.
- Use error codes or error classes, not raw strings.
- Include context: what operation failed, what input caused it, what was expected.
- Distinguish client errors (bad input) from server errors (internal failure).

## Error Chains
- Wrap lower-level errors with context when propagating up the stack.
- Preserve the original error as a `cause` for debugging.
- Do not swallow errors silently. Catch → handle OR re-raise with context.
- Log the full error chain at the point where the error is finally handled.

```python
try:
    result = await api.get_market(ticker)
except aiohttp.ClientError as e:
    raise MarketDataError(f"Failed to fetch market {ticker}") from e
```

## Recovery Patterns
- Retry with exponential backoff for transient failures (network, rate limits).
- Set maximum retry counts and circuit breakers for external dependencies.
- Provide fallback values or degraded functionality when non-critical services fail.
- Use timeouts on ALL external calls. A hanging request is worse than a failed one.

## Logging
- Log errors with structured data: timestamp, error type, message, stack, request context.
- Use levels: ERROR for failures, WARN for degraded behavior, INFO for operations.
- Include correlation IDs to trace errors across services.

## Anti-Patterns
- No empty catch blocks (`except: pass`).
- No exceptions for control flow.
- No returning None to indicate failure — use Result types or raise typed errors.
- No log-and-throw the same error (duplicate log entries).
