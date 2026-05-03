# Stack: Next.js 15 + Firebase + MUI v7

Generic conventions for any project using Next.js 15 (App Router), TypeScript, React 19, Material UI v7, Firebase Auth, and Firestore. Project-specific rules (schema, routes, theme tokens) live in each repo's `.github/instructions/`.

---

## TypeScript best practices

- Never use `any` — use `unknown` + type guards, or define an explicit type. Always `error: unknown` in catch blocks.
- Always type API responses: `const data = await res.json() as MyType` — never `as any`.
- Use `as Type` sparingly and only when certain; prefer `z.infer<typeof Schema>` from Zod.

## JSX / HTML entity guidelines

- Escape raw apostrophes and quotes in JSX text — use `&apos;`, `&quot;`, `&lt;`, `&gt;`, `&amp;` to avoid ESLint errors.

---

## Next.js 15 patterns

- **`params` is a Promise** — always `const { id } = await params` before use in Server Components:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

- **Server vs. client boundary** — prefer Server Components for data fetching; never expose Firebase Admin credentials in the browser; never import the Admin SDK in a `"use client"` file.
- **Route handlers** live under `src/app/api/*`; create `GET`/`POST` handlers returning `NextResponse`.
- `page.tsx` and `layout.tsx` must default export a React component; `loading.tsx` must default export a component.
- Keep client components minimal — use `"use client"` only when you need state, effects, or refs.
- Target React 19/Next 15 patterns; do not use legacy pages router APIs.

---

## MUI v7 layout best practices

- **DO NOT use the old Grid API** — avoid `<Grid container>` and `<Grid item xs={12}>` (deprecated in MUI v7).
- **Responsive grid** — use native CSS Grid via `Box` with `sx`:

```tsx
<Box sx={{
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
  gap: 2,
}}>
  <Card>...</Card>
</Box>
```

- **Simple stacking** — use `Stack` with `direction` and `spacing`.
- **Flex layouts** — use `Box` with `display: 'flex'` and flex properties in `sx`.
- **Icon components from `ElementType` props** — use type assertion:

```tsx
const IconComponent = item.icon as React.ComponentType<{ fontSize?: 'small' | 'medium' | 'large' }>
return <IconComponent fontSize="small" />
```

- Prefer `<Link>` over polymorphic `Typography` when you need `href`.
- For images inside MUI cards, avoid `CardMedia` typing pitfalls — use `Box component="img"` or a Box wrapper + `img`.
- Always reference colors via MUI theme tokens in `sx` — never hard-code hex values in new code.

---

## Forms (MUI + React Hook Form + Zod)

- For new forms: Material UI + React Hook Form + Zod.
- Define a Zod schema; use `zodResolver` with RHF.
- For numeric fields, use a `coerceNum` helper (or `z.coerce.number()`) to avoid empty-string/NaN issues.
- Group fields into section cards: `Stack`, `Typography`, `TextField`, `Button`, `Alert`, `CircularProgress`.
- Keep styling in MUI `sx`; do not mix Tailwind in form code.
- Presentational client component that accepts typed props; parent (Server Component) fetches data and injects via props.

---

## Firebase Auth — session cookie pattern (generic)

- Exchange a Firebase ID token for an HttpOnly session cookie via a `POST /api/auth/session` route handler.
- Use `adminAuth.createSessionCookie(idToken, { expiresIn })` server-side.
- `DELETE /api/auth/session` clears the cookie on sign-out.
- Session cookie must be `HttpOnly` and `Secure` in production.
- Custom claims (e.g. `isSubscribed`) are only set via the Admin SDK, never from the client.
- Never import the Admin SDK (`firebase-admin`) in any `"use client"` file.
- No sensitive values should be prefixed `NEXT_PUBLIC_` — those are exposed in the browser bundle.

---

## Firestore — server helper pattern (generic)

Use in Server Components and API routes via the Admin SDK (`adminDb`):

```typescript
import { adminDb } from "@/lib/firebase/admin";

export async function getActiveItems(): Promise<Item[]> {
  const snap = await adminDb.collection("items").where("isActive", "==", true).get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return { id: doc.id, title: d.title as string } satisfies Item;
  });
}
```

## Firestore — real-time client subscription pattern (generic)

Use in `"use client"` components only:

```typescript
"use client";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

useEffect(() => {
  const q = query(collection(db, "collectionName"), where("status", "==", "active"));
  const unsub = onSnapshot(q, (snap) => {
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MyType));
  });
  return unsub; // always return the unsubscribe function
}, []);
```

---

## Data fetching & fallbacks

Server-first fetching with try/catch and typed placeholder fallback is acceptable for prototypes:

```ts
let data = sampleItems
try {
  const res = await fetch(url, { cache: "no-store" })
  if (res.ok) data = await res.json() as MyType[]
} catch {}
```

---

## Build & quality

- Lint with `eslint-config-next`; build with `next build`.
- Target React 19/Next 15 patterns.
