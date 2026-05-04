---
applyTo: '**'
---

# Node.js + Firebase Admin — global stack conventions

Applies to any Node.js 20+ / TypeScript project using the Firebase Admin SDK and deployed to Cloud Run or Cloud Functions. Stack-level rules only — project overrides live in each repo's `.github/instructions/`.

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` — treat as non-negotiable
- No `any`. Use `unknown` in catch blocks; narrow with type guards before use
- No non-null assertion (`!`) unless existence is proven by a prior check in the same scope
- Prefer `interface` for object shapes, `type` for unions/computed types
- Export types with `import type { ... }` — never export runtime values alongside types unless necessary

## Environment variables

- Never hard-code credentials. Read from `process.env` using a `requireEnv(name)` helper that throws if missing
- `FIREBASE_PRIVATE_KEY` is stored with literal `\n` — always call `.replace(/\\n/g, '\n')` before passing to `cert()`
- Cloud Run env vars are set via `--set-env-vars` at deploy time. Local: use `.env.local` (gitignored), loaded manually at startup — do not use `dotenv` as a runtime dependency
- Never log env var values, even partially

## Firebase Admin SDK

- Call `initializeApp()` once at module load time, guarded with `if (getApps().length === 0)`
- Always use `getFirestore()`, `getAuth()` etc. after init — never import the default app directly
- Use `FieldValue.serverTimestamp()` for `createdAt` / `updatedAt` — never `new Date()` on writes
- Reads return `DocumentSnapshot` — always check `.exists` before calling `.data()`
- Use `void ref.update(...)` for fire-and-forget writes that should not block the response

## Firestore patterns

- All collection/document helpers live in `src/firestore/` — one file per top-level collection
- Never construct collection paths with string concatenation — use typed helper functions
- v1 search = fetch recent docs, filter in-memory with `.toLowerCase().includes(query)`. Comment `// TODO v2: replace with vector search`
- Limit all unbounded queries: default 10, max 50, cap with `Math.min(input.limit ?? 10, 50)`
- Compound queries require a composite index in `firestore.indexes.json` — add it when you add the query

## HTTP / Cloud Run

- Entry point (`src/index.ts`) creates a plain `node:http` server — no Express unless explicitly chosen
- Always handle `try/catch` around async route handlers; check `res.headersSent` before writing an error response
- Return `application/json` for all non-SSE responses
- CORS headers only in `NODE_ENV !== 'production'` — Cloud Run is the auth boundary in production

## Error handling

- Use `unknown` in catch: `catch (err: unknown)`
- Log with `console.error` — include the error object, not just the message
- Never expose internal error details in HTTP responses — generic `'Internal server error'` only

## Security

- API key validation: SHA-256 hash the input, compare with `timingSafeEqual` against stored hash
- Never log API keys, hashes, or session tokens
- `Authorization: Bearer <key>` header only — never accept keys in query params or body
- Reject requests before any Firestore access if auth fails
