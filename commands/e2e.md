---
description: Generate and run end-to-end tests with Playwright. Creates test journeys, runs tests, captures screenshots/videos/traces.
---

# E2E Command

Generate, maintain, and execute end-to-end tests using Playwright.

## Workflow

1. Analyze the user flow and identify test scenarios
2. Generate Playwright tests using Page Object Model pattern
3. Run tests across browsers (Chrome, Firefox, Safari)
4. Capture failures with screenshots, videos, and traces
5. Report results and identify flaky tests

## When to Use

- Testing critical user journeys (login, checkout, multi-step flows)
- Verifying UI interactions and navigation
- Validating frontend-backend integration
- Pre-deployment verification

## Test Artifacts

**On all tests:** HTML report, JUnit XML for CI.

**On failure only:** Screenshot of failing state, video recording, trace file (step-by-step replay), network and console logs.

## Best Practices

- Use Page Object Model for maintainability
- Use `data-testid` attributes for selectors (not brittle CSS classes)
- Wait for API responses, not arbitrary timeouts (`page.waitForResponse`)
- Test critical user journeys, not implementation details
- Use unit tests for edge cases; E2E for integration flows
- Review artifacts when tests fail
- Mark intermittent failures with `test.fixme()` and investigate root cause (missing waits, race conditions, animations)

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps
- name: Run E2E tests
  run: npx playwright test
- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Quick Commands

```bash
npx playwright test                              # Run all E2E tests
npx playwright test tests/e2e/some.spec.ts       # Run specific file
npx playwright test --headed                     # See browser
npx playwright test --debug                      # Debug mode
npx playwright codegen http://localhost:3000     # Generate test code
npx playwright show-report                       # View HTML report
npx playwright show-trace artifacts/trace.zip    # Replay trace
```

## Related Commands

- `/plan` - Identify critical journeys to test
- `/tdd` - Unit tests (faster, more granular)
- `/code-review` - Verify test quality
