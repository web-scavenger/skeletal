# skeletal-ui

> Automate skeleton loading screens for React and Next.js TypeScript projects.

skeletal-ui scans your TypeScript source, crawls your running app with Playwright to capture real element geometry, and generates pixel-accurate `.skeleton.tsx` files — no manual skeleton code, no layout drift.

**[Full docs →](https://web-scavenger.github.io/skeletal/)** · **[Live demo →](https://web-scavenger.github.io/skeletal/demo)**

---

## Installation

```sh
npm install skeletal-ui
# peer deps: react >=18, typescript >=5.0
```

Optional (for browser crawl):

```sh
npx playwright install chromium
```

---

## Quick start

**1. Init**

```sh
npx skeletal-ui init
```

**2. Start your dev server, then analyze**

```sh
npx skeletal-ui analyze
```

**3. Import styles once**

```tsx
// app/layout.tsx or main.tsx
import 'skeletal-ui/styles.css'
```

---

## The four patterns

| Pattern | Trigger | What skeletal-ui does |
|---|---|---|
| **RSC** | `async` component inside `<SkeletonWrapper>` | generates skeleton, adds `fallback` prop |
| **CSR** | non-async component inside `<SkeletonWrapper>` | generates skeleton, adds `fallback` prop |
| **lazy** | `React.lazy(() => import('./X'))` | generates skeleton, replaces with `lazyWithSkeleton` |
| **dynamic** | `next/dynamic(() => import('./X'))` | generates skeleton, replaces with `dynamicWithSkeleton` |

---

## CLI

| Command | Description |
|---|---|
| `skeletal-ui init` | Interactive setup, creates `skeletal.config.ts` |
| `skeletal-ui analyze [--no-browser] [--dry-run] [--only Name]` | Scan, crawl, generate, wire |
| `skeletal-ui check [--json]` | Assert skeletons are up to date (use in CI) |
| `skeletal-ui watch` | Re-analyze on source changes |
| `skeletal-ui preview` | Browse all skeletons locally |
| `skeletal-ui eject <Name>` | Copy skeleton into source for manual editing |

---

## Requirements

| | Version |
|---|---|
| Node.js | `>= 18` |
| TypeScript | `>= 5.0` |
| React | `>= 18` |
| `@playwright/test` | `>= 1.44` _(optional)_ |

TypeScript-only. JavaScript projects are not supported.

---

**[Full docs →](https://web-scavenger.github.io/skeletal/)** — primitives reference, config schema, framework integrations, CI guide, patterns deep-dive.

## License

MIT
