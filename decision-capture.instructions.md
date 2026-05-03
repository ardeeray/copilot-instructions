# Decision capture

Universal process for recording architectural decisions and changelogs. Works in any project. The project-specific instruction file supplies the actual log file paths, extra entry fields, and linkback comment syntax.

---

## Mid-task — detect decision signals

Watch for these signals during any task. When one fires, start probing **immediately** — one question at a time, do not wait until the end:

- User says "I don't want to use X" / "let's not do Y"
- User says "should we use X or Y?"
- A choice between two or more libraries/approaches is visible in the code being written
- A file or feature is being deleted or removed rather than just changed
- User message contains "because" or "since" explaining a choice

**Deep interview — ask sequentially, one at a time:**

For each question, present 3–4 context-aware suggested answers inferred from the current task (code, libraries, conversation). Always include a "Something else — I'll describe it" option. Wait for the response before asking the next question.

1. "What alternatives did you consider?" — suggest the most likely competing libraries/approaches given the context
2. For each alternative the user did **not** choose, ask a separate follow-up: "Why did you reject [X]?" — suggest 3–4 rejection reasons tailored specifically to that option. Loop through all rejected options one at a time before moving to Q3.
3. "Are there any risks you're accepting with this choice?" — suggest plausible risks based on the chosen approach
4. "Is there a condition that would make you revisit this?" — suggest realistic trigger conditions (e.g. scaling threshold, competitor ships feature, dependency drops support)

---

## End of task — propose entries

After completing any task where a decision was made:

1. Draft a decision entry (see fields below) and ask: *Should I add this to the decisions log?*
2. If a feature shipped, was removed, or a notable technical change was made, ask separately: *Should I add a changelog entry?*
3. For source files touched by the decision, propose a linkback comment at the relevant call site. (The project-specific file supplies the exact comment syntax.)

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

## Decision entry fields (all required)

| Field | Description |
|---|---|
| **Category** | Architecture \| Feature scope \| Library \| Security \| Cross-system contract |
| **Context** | Why the decision came up |
| **Decision** | What was decided |
| **Alternatives considered** | Each rejected option + reason for rejection |
| **Rationale** | Why this choice over the alternatives |
| **Risks accepted** | Known downsides being lived with |
| **Revisit when** | Condition that would change this decision |
| **Affected** | Source files and docs impacted |

## Changelog entry fields

| Field | Description |
|---|---|
| **Type** | Feature \| Technical \| Removal \| Deferral |
| **Summary** | One-liner description |
| **Related decision** | Decision reference (optional) |
