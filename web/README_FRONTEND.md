# Frontend app structure (Next.js app router)

We split the UI into three route groups under `src/app` using the Next.js App Router approach:

- `(customer)` - Public-facing site for visitors
- `(owner)` - Owner portal (requires OWNER role)
- `(admin)` - Admin portal (requires ADMIN role)

Each group has its own `layout.tsx` and a placeholder `page.tsx`. Shared components live in `src/app/components`.

How to run

```bash
# from repo root
cd web
npm install
npm run dev
```

Where to integrate auth

- Replace `src/app/components/AuthGuard.tsx`'s `getUserRole()` with a real auth call (Firebase Auth or API).
- Optionally implement server-side session checks in `middleware.ts`.

Routing notes

- `/` -> root app `src/app/page.tsx` (customer entry)
- `/owner` -> owner portal (served by `(owner)` group)
- `/admin` -> admin portal

Next steps

- Implement auth integration (Firebase) and role-aware navigation
- Build owner/admin dashboards and resource pages
- Add UI framework (Tailwind/Chakra/Material) and shared design tokens
