# Decision capture

Universal process for recording architectural decisions and changelogs. Works in any project with zero setup — all defaults are defined here. Project-specific instruction files may override paths, add extra fields, and change the linkback path.

---

## Defaults

| Setting | Default value |
|---|---|
| **Decisions file** | `~/copilot-instructions/files/decisions.md` |
| **Changelog file** | `~/copilot-instructions/files/changelog.md` |
| **Entry numbering** | `DEC-NNN` sequential — read existing `## DEC-NNN` headings in the file to find the next available number |
| **Override rule** | If a project-specific instruction file defines different paths or extra fields, those take precedence over these defaults |

---

## Mid-task — detect decision signals

Watch for these signals during any task. When one fires, start probing **immediately** — one question at a time, do not wait until the end:

- User says "I don't want to use X" / "let's not do Y"
- User says "should we use X or Y?"
- A choice between two or more libraries/approaches is visible in the code being written
- A file or feature is being deleted or removed rather than just changed
- User message contains "because" or "since" explaining a choice

**Deep interview — ask sequentially, one at a time:**

For each question, present as many as you can context-aware suggested answers inferred from the current task (code, libraries, conversation). Always include a "Something else — I'll describe it" option. Wait for the response before asking the next question.

1. "What alternatives did you consider?" — suggest the most likely competing libraries/approaches given the context
2. For each alternative the user did **not** choose, ask a separate follow-up: "Why did you reject [X]?" — suggest 3–4 rejection reasons tailored specifically to that option. Loop through all rejected options one at a time before moving to Q3.
3. "Are there any risks you're accepting with this choice?" — suggest plausible risks based on the chosen approach
4. "Is there a condition that would make you revisit this?" — suggest realistic trigger conditions (e.g. scaling threshold, competitor ships feature, dependency drops support)

---

## End of task — propose entries

After completing any task where a decision was made:

1. Draft a decision entry using the format below and ask: *Should I add this to the decisions log?*
2. If a feature shipped, was removed, or a notable technical change was made, ask separately: *Should I add a changelog entry?*
3. For source files touched by the decision, propose a linkback comment using the per-language format in the **Linkback comments** section below.

---

## What triggers a decision entry vs. a changelog entry

**Decision entry** (when rationale is worth preserving):
- Choosing one library/framework/pattern over a viable alternative
- Permanently removing or deferring a planned feature
- Changing an established architectural pattern
- Security policy choice
- Cross-system contract design (field naming, schema, shared types, API shape)

**Changelog entry** (every notable change, regardless of whether there is a decision entry):
- Any feature that ships (complete, not stubbed)
- Any feature that is permanently removed or deferred
- Notable technical change: library swap, architectural shift, major dependency bump

---

## Entry format

### Decision entry

Write the entry as a top-level heading in the decisions file (newest at top):

```markdown
## DEC-NNN [YYYY-MM-DD] Short title
**Category**: Architecture | Feature scope | Library | Security | Cross-system contract
**Context**: Why this decision came up
**Decision**: What was decided
**Alternatives considered**: Option A (rejected: reason); Option B (rejected: reason)
**Rationale**: Why this choice over the alternatives
**Risks accepted**: Known downsides being lived with
**Revisit when**: Condition that would change this decision
**Affected**: path/to/file.ts, docs/category/slug.md
```

### Changelog entry

Write the entry as a top-level heading in the changelog file (newest at top):

```markdown
## [YYYY-MM-DD] Short summary
**Type**: Feature | Technical | Removal | Deferral
**Summary**: One-liner description of the change
**Related decision**: DEC-NNN (omit if none)
```

---

## Linkback comments

After writing a decision entry, add a linkback comment near the relevant code. Use the format for the file's language. If a project-specific override is active, replace the path portion with the project-specific decisions file path.

| Language | Comment format |
|---|---|
| TypeScript / JavaScript / Dart / Java / Swift / C# | `// Decision: DEC-NNN ~/copilot-instructions/files/decisions.md#dec-nnn` |
| Python / Shell / YAML / TOML | `# Decision: DEC-NNN ~/copilot-instructions/files/decisions.md#dec-nnn` |
| HTML / XML / Markdown | `<!-- Decision: DEC-NNN ~/copilot-instructions/files/decisions.md#dec-nnn -->` |

Anchor format: heading `## DEC-001 [...]` → anchor `#dec-001` (lowercase, spaces to hyphens, strip brackets and other punctuation).

---

## Looking up a decision

When a user references a decision number (e.g. "look up DEC-042" or "what was the decision on X?"):

1. Check if a project-specific instruction file defines a decisions file path. If so, read that file.
2. Otherwise read `~/copilot-instructions/files/decisions.md`.
3. Find the `## DEC-NNN` heading and return the full entry.
