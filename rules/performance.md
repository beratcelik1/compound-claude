# Performance Rules

## Caching
- Cache expensive computations with memoization. Invalidate when inputs change.
- Implement application-level caching for repeated database queries or API calls.
- Always define a cache invalidation strategy before adding a cache.

## Database Performance
- Add indexes on columns used in WHERE, JOIN, ORDER BY.
- Avoid N+1 queries. Use eager loading, joins, or batch queries.
- Use pagination for list endpoints. Prefer cursor-based for large datasets.
- Profile slow queries with EXPLAIN ANALYZE.
- Use connection pooling. Never open a new connection per request.
- Keep transactions short. Don't hold locks during I/O.

## API Performance
- Minimize payload size. Return only needed fields.
- Use compression (gzip) for API responses.
- Implement request batching for clients needing multiple resources.
- Add request timeouts on both client and server sides.

## Async Performance (Python)
- Use `asyncio.gather()` for concurrent I/O, not sequential awaits.
- Never put blocking calls inside async functions without `run_in_executor`.
- Monitor event loop lag — blocked loop stalls all coroutines.
- Use bounded queues (`asyncio.Queue(maxsize=N)`) to prevent unbounded memory growth.
- Profile with `py-spy` or `scalene` to find hot paths.

## General
- Measure before optimizing. Use profiling tools, not intuition.
- Set performance budgets: API response time, throughput targets.
- Alert on P95/P99 latency, not just averages.
- Log slow queries and slow API responses for investigation.
