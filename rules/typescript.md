---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Rules

## Type Safety
- NEVER use `any` without strong justification and a comment
- Leverage union types, discriminated unions, type guards
- Use `satisfies` operator for type checking with inference
- Prefer type inference where TypeScript can infer correctly

## Style
- `const` by default, `let` only when necessary, never `var`
- Named exports over default exports
- Destructuring, spread, optional chaining, nullish coalescing
- Immutable patterns over mutation

## Imports
- Group: external libs -> internal modules -> types -> styles
- Named imports over default exports
- No wildcard imports

## Testing
- Use project's test framework (see `rules/testing.md`)

## Error Handling
- Typed error handling with discriminated unions
- Async/await over raw promises
