# Documentation conventions

Generic rules for any project. Project-specific overrides (doc store URLs, folder structure, YAML frontmatter, what URL to mention when asking) live in each repo's `.github/instructions/`.

---

## Key concepts section

Every architecture and feature doc must include a `## Key concepts` section at the bottom (after `## Manual fallback` if present). Format:

```markdown
## Key concepts

**Why does X work this way?**

> Because Y — the key insight is Z.

**What happens when A fails?**

> B takes over. The thing to watch for is C.
```

Include 3–5 questions a new developer would ask. Apply whenever creating or significantly editing a doc.

---

## Doc-worthy triggers

Only ask at the end of a task when the change matches one of these:

- New feature, screen, route, or major UI surface
- New external API integration or service
- New or changed build/CI step, environment variable, or required config
- Data store schema change (new collection, field, table, renamed field, security rule)
- Breaking refactor that changes how other features should be built

**NOT doc-worthy** — do not ask: bug fixes, copy/style tweaks, dependency bumps, test-only changes, internal refactors with no API surface change.

**What to ask** — at the very end of the task, ask exactly:
> Should I also update the docs?

Project files override this with the specific location or URL to mention.

---

## Manual fallback section

Every doc-worthy doc must end with a `## Manual fallback` section.

**Inline vs. separate file:**
- ≤ ~30 lines, one-shot → inline fenced code block
- Longer, reusable, or destructive → separate script file — link from the doc

**Required for every script:**
1. ⚠️ banner if the script writes or deletes data + dry-run mode (`DRY_RUN=1` or `--dry-run`)
2. Env-var placeholders only — never hard-code project IDs, credentials, or secrets
3. Required IAM / permission role noted in header
4. Rollback/undo steps in the doc
5. Expected output snippet (1–10 lines)

**File header template:**
```ts
/**
 * Purpose: <one line>
 * Doc:     docs/<category>/<slug>.md
 * IAM:     <role(s) required>
 * Env:     <ENV_VAR_1>, <ENV_VAR_2>
 * Destructive? yes/no  | Dry-run flag: DRY_RUN=1
 */
```

**Security:** Never paste service-account JSON, API keys, or session tokens into a script or doc. Reference `.env` files by name only.

**When NO script is needed:** State `_No manual fallback — reference doc only._` in place of the section.
