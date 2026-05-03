# Error capture

Universal process for documenting errors and their fixes. Works in any project with zero setup — all defaults are defined here. Project-specific instruction files may override the errors file path.

---

## Defaults

| Setting | Default value |
|---|---|
| **Errors file** | `~/copilot-instructions/errors.md` |
| **Override rule** | If a project-specific instruction file defines a different errors file path, that takes precedence |

---

## When to document

Only add an entry when the user **explicitly asks** — e.g. "add this to the errors log", "document this error", "save this fix". Do not propose adding entries proactively.

When the user asks to look up a past error (e.g. "have we seen this before?", "check the errors log"), read the errors file and scan for a matching H3 heading.

---

## Dedup rule

Before adding a new entry, scan the existing H3 headings in the errors file. If a sufficiently similar error already exists, offer to **update the existing entry** rather than add a duplicate.

---

## Entry format

Entries are H3 headings with four fields. Newest entries go at the bottom of whichever section they belong to (or the bottom of the file if no sections are used).

```markdown
### One-line description of the error

**Quick fix:** One sentence on what resolves this.

**Full error:**
```
Paste exact terminal output, device log, or browser console error here.
```

**Fix steps:**
1. Step one
2. Step two
3. Verify it works by doing X
```

**Field rules:**
- **H3 title** — the error in plain language; specific enough to find by scanning headings (not "Build failed")
- **Quick fix** — one sentence only; the single most important thing to do
- **Full error** — exact copy-paste from terminal, device logs, or browser console; do not paraphrase
- **Fix steps** — numbered; every step must be actionable without additional context

---

## Section structure

Organizing entries into `## Platform` sections (e.g. `## Flutter / Android`, `## Firebase`, `## Next.js`) is recommended when the file grows large, but left to each project. The global `errors.md` is a flat list by default.

---

## Looking up an error

When the user asks to look up a past error:

1. Check if a project-specific instruction file defines an errors file path. If so, read that file.
2. Otherwise read `~/copilot-instructions/errors.md`.
3. Scan H3 headings for a match and return the full entry.
