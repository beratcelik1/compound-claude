---
name: eval-skills
description: "Run 3-tier evaluation on all skills: static validation, E2E testing, LLM-as-judge grading"
---

Run the 3-tier skill evaluation infrastructure. Parse the arguments from: $ARGUMENTS

## Tiers
1. **Static validation** (free) — checks frontmatter, required sections, file sizes
2. **E2E eval** (~$4/run per skill) — runs the skill via `claude -p`, checks for errors
3. **LLM judge** (~$0.15/run per skill) — grades skill doc on clarity, completeness, actionability

## Argument Parsing
- No flags or empty: run static validation only (Tier 1)
- `--e2e <skill-name>`: run E2E eval on the named skill (Tier 2)
- `--judge <skill-name>`: run LLM judge on the named skill (Tier 3)
- `--all`: run all 3 tiers on ALL skills (expensive — confirm cost with user first)
- `--judge-all`: run LLM judge on all skills
- `--e2e-all`: run E2E eval on all skills

## Execution

### Tier 1: Static Validation
Run: `bash ~/.claude/scripts/eval/static-validate.sh`
Always runs. Report results.

### Tier 2: E2E Eval (only with --e2e or --all)
Before running, warn the user: "E2E eval costs ~$4 per skill. Proceed?"
Wait for confirmation via AskUserQuestion.
Run: `bash ~/.claude/scripts/eval/e2e-eval.sh <skill-name>`
Report results from the JSON output file.

### Tier 3: LLM Judge (only with --judge or --all)
Run: `bash ~/.claude/scripts/eval/llm-judge.sh <skill-name>`
Report scores and pass/fail.

### --all Flag
1. Run static validation
2. List all skills and total count
3. Warn: "Running all 3 tiers on N skills. Estimated cost: ~$N*4.15. Proceed?"
4. Wait for confirmation
5. Run E2E + LLM judge on each skill, collect results
6. Print summary table

## Output Format
Present results as a clean table:
| Skill | Static | E2E | Judge | Total |
Use checkmarks/X for pass/fail. Show scores for judge tier.
