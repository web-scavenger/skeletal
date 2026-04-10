# skeletal-ui

> Automate skeleton loading screens for React and Next.js TypeScript projects.

skeletal-ui scans your codebase, crawls your running app with Playwright to capture real element geometry (bounding box, border-radius, font-size, line-height), and generates pixel-accurate `.skeleton.tsx` files — no manual skeleton code, no copy-pasting CSS, no drift from the real UI.

**[Live demo →](https://web-scavenger.github.io/skeletal/)**

```sh
npx skeletal-ui analyze
```

---

## Table of contents

- [How it works](#how-it-works)
- [Installation](#installation)
- [Quick start](#quick-start)
- [The four patterns](#the-four-patterns)
  - [RSC — async Server Components](#rsc--async-server-components)
  - [CSR — client components](#csr--client-components)
  - [React.lazy](#reactlazy)
  - [next/dynamic](#nextdynamic)
- [Primitives](#primitives)
  - [Sk.Text](#sktext)
  - [Sk.Heading](#skheading)
  - [Sk.Avatar](#skavatar)
  - [Sk.Image](#skimage)
  - [Sk.Button](#skbutton)
  - [Sk.Badge](#skbadge)
  - [Sk.Number](#sknumber)
  - [Sk.Icon](#skicon)
  - [Sk.List](#sklist)
  - [Sk.Card](#skcard)
- [SkeletonWrapper](#skeletonwrapper)
- [SkeletonProvider](#skeletonprovider)
- [CLI reference](#cli-reference)
- [Configuration reference](#configuration-reference)
- [Framework integrations](#framework-integrations)
- [CI integration](#ci-integration)
- [Requirements](#requirements)

---

## How it works

1. **Scan** — skeletal-ui reads your TypeScript source and finds components wrapped in `<SkeletonWrapper>`, `React.lazy()`, or `next/dynamic()`.
2. **Crawl** — Playwright opens each route of your running dev server, waits for load, and records the bounding box, border-radius, font-size, and line-height of every marked element — the exact computed values from the browser, accounting for your Tailwind config and custom CSS.
3. **Generate** — a `.skeleton.tsx` file is co-located next to each component, using `Sk.*` primitives sized to pixel-accurately match the real layout with no layout jump on state change.
4. **Wire** — the codemod patches your source files so the skeleton is shown automatically while the real component loads.

Re-run `skeletal-ui analyze` any time your component changes. `skeletal-ui check` fails the build if skeletons are stale — use it in CI.

---

## Installation

```sh
npm install skeletal-ui
# or
pnpm add skeletal-ui
# or
yarn add skeletal-ui
```

For browser crawl (one-time, optional but recommended):

```sh
npx playwright install chromium
```

> **Without Playwright** you can still use `skeletal-ui analyze --no-browser` to generate minimal placeholder skeletons instantly using AST-only classification.

---

## Quick start

**1. Initialise**

```sh
npx skeletal-ui init
```

Walks you through setup and creates `skeletal.config.ts`.

**2. Start your dev server, then analyse**

```sh
npx skeletal-ui analyze
```

Finds candidates, crawls routes, generates `.skeleton.tsx` files, and patches your source.

**3. Import the default styles once**

```tsx
// app/layout.tsx  (Next.js)  or  main.tsx  (Vite)
import 'skeletal-ui/styles.css'
```

Done. Your components now show pixel-accurate skeleton screens while they load.

---

## The four patterns

skeletal-ui detects and wires four patterns automatically.

| Pattern | Trigger | What skeletal-ui does |
|---|---|---|
| **RSC** | `async` component inside `<SkeletonWrapper>` | generates skeleton, adds `fallback` prop |
| **CSR** | non-async component inside `<SkeletonWrapper>` | generates skeleton, adds `fallback` prop |
| **lazy** | `React.lazy(() => import('./X'))` | generates skeleton, replaces with `lazyWithSkeleton` |
| **dynamic** | `next/dynamic(() => import('./X'))` | generates skeleton, replaces with `dynamicWithSkeleton` |

---

### RSC — async Server Components

Wrap your component in `<SkeletonWrapper>`:

```tsx
import { SkeletonWrapper } from 'skeletal-ui'
import { UserCard } from './UserCard'

export default function Page() {
  return (
    <SkeletonWrapper>
      <UserCard userId="u_001" />
    </SkeletonWrapper>
  )
}
```

After `skeletal-ui analyze`, the wrapper is patched with the generated skeleton:

```tsx
// auto-wired by skeletal-ui
import { UserCardSkeleton } from './UserCard.skeleton'

<SkeletonWrapper fallback={<UserCardSkeleton />}>
  <UserCard userId="u_001" />
</SkeletonWrapper>
```

`UserCard.skeleton.tsx` is generated alongside `UserCard.tsx`. Sizes come from Playwright's computed styles — bar heights match the font-size, outer heights match the line-height, so the layout takes up identical space whether loaded or not:

```tsx
// UserCard.skeleton.tsx — auto-generated, safe to edit after ejecting
// skeletal:hash:a1b2c3d4
// skeletal:pattern:rsc
'use client'
import { Sk } from 'skeletal-ui'

export function UserCardSkeleton() {
  return (
    <div className="user-card">
      <Sk.Avatar size={64} />
      <div className="user-card__body">
        <Sk.Heading height="22px" width="55%" />
        <Sk.Text lines={2} height="14px" gap="12px" width="80%" />
      </div>
      <Sk.Button width={80} height={32} />
    </div>
  )
}

export { UserCardSkeleton as skeleton }
```

---

### CSR — client components

Same pattern as RSC. skeletal-ui detects whether the component function is `async` or not — non-async components get the `csr` pattern, which skips the Playwright `networkidle` wait (no server data to await). Use the `loading` prop to control skeleton display explicitly:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { SkeletonWrapper } from 'skeletal-ui'

export function ProfileCard({ username }: { username: string }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch(`/api/stats/${username}`).then(r => r.json()).then(setStats)
  }, [username])

  // ...
}

// Wrap with loading prop for explicit CSR control
<SkeletonWrapper loading={!stats} fallback={<ProfileCardSkeleton />}>
  <ProfileCard username="alex" />
</SkeletonWrapper>
```

---

### React.lazy

```tsx
// Before
import React from 'react'
const HeavyChart = React.lazy(() => import('./HeavyChart'))

// After — auto-applied by `skeletal-ui analyze`
import { lazyWithSkeleton } from 'skeletal-ui'
const HeavyChart = lazyWithSkeleton(() => import('./HeavyChart'))
```

`lazyWithSkeleton` is a drop-in replacement for `React.lazy`. It wraps the factory, loads the component's `skeleton` named export after the first render, and exposes it on `HeavyChart.skeleton` so `SkeletonWrapper` can find it.

---

### next/dynamic

```tsx
// Before
import dynamic from 'next/dynamic'
const Map = dynamic(() => import('./MapComponent'), { ssr: false })

// After — auto-applied by `skeletal-ui analyze`
import { dynamicWithSkeleton } from 'skeletal-ui/next'
const Map = dynamicWithSkeleton(() => import('./MapComponent'), { ssr: false })
```

`dynamicWithSkeleton` is a drop-in replacement for `next/dynamic` with the same options API.

> **Important:** `skeletal-ui/next` is safe to import in page files. The build-time Next.js transform lives at `skeletal-ui/next-transform` (for `next.config.mjs` only).

---

## Primitives

Import and use anywhere in your skeleton files:

```tsx
import { Sk } from 'skeletal-ui'
```

All primitives are CSS-only (no JavaScript animation), server-safe, and zero-dependency. They render `aria-hidden="true"` spans so screen readers skip them.

### Sk.Text

Multi-line text block with a shorter last line. When generated by `skeletal-ui analyze`, `height` is set to the element's computed `font-size` and `lineHeight` is set to the element's computed `line-height`, so each bar looks visually natural while the element takes up exactly the same space as real text.

```tsx
<Sk.Text />                                    // single line, full width
<Sk.Text lines={3} />                          // 3 lines
<Sk.Text lines={3} lastLineWidth="40%" />
<Sk.Text width="80%" />
<Sk.Text height="14px" lineHeight="20px" />    // precise sizing (auto-generated)
<Sk.Text lines={3} height="14px" gap="6px" />  // multi-line with exact gap
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `lines` | `number` | `1` | Number of text lines |
| `width` | `string` | `'100%'` | Width of all lines except last |
| `lastLineWidth` | `string` | `'60%'` | Width of the last line (multi-line only) |
| `height` | `string` | `'1em'` | Height of each bar (set to `font-size` by analyzer) |
| `lineHeight` | `string` | — | Outer container height for single-line (set to computed `line-height` by analyzer for layout stability) |
| `gap` | `string` | `'0.4em'` | Gap between bars (multi-line only; set by analyzer so total height matches bounding box) |
| `className` | `string` | — | Applied to outer wrapper; use for margin/spacing classes |

---

### Sk.Heading

Single-line heading block. When generated, `height` is set to the element's actual bounding-box height — so multi-line headings (h3 that wraps) are correctly represented as a single taller block.

```tsx
<Sk.Heading />
<Sk.Heading width="50%" />
<Sk.Heading height="42px" width="88%" />  // auto-generated: exact bounding box height
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `string` | `'70%'` | Width of the block |
| `height` | `string` | `'1.4em'` | Height of the block (overridden by analyzer with exact bounding box height) |
| `className` | `string` | — | Extra CSS class |

---

### Sk.Avatar

Circular or square avatar placeholder.

```tsx
<Sk.Avatar />
<Sk.Avatar size={48} />
<Sk.Avatar size={32} shape="square" />
```

| Prop | Type | Default |
|---|---|---|
| `size` | `number` | `40` |
| `shape` | `'circle' \| 'square'` | `'circle'` |
| `className` | `string` | — |

---

### Sk.Image

Rectangular image placeholder with aspect ratio support. Also used for `aspect-*` container divs detected during analysis.

```tsx
<Sk.Image />                          // 16/9, full width
<Sk.Image aspectRatio="4/3" />
<Sk.Image aspectRatio="16/9" width="100%" />  // auto-generated for aspect-video divs
<Sk.Image width={300} height={200} />
```

| Prop | Type | Default |
|---|---|---|
| `width` | `string \| number` | `'100%'` |
| `height` | `string \| number` | — |
| `aspectRatio` | `string` | `'16/9'` |
| `className` | `string` | — |

---

### Sk.Button

Inline button placeholder.

```tsx
<Sk.Button />
<Sk.Button width={160} height={40} />
```

| Prop | Type | Default |
|---|---|---|
| `width` | `string \| number` | `120` |
| `height` | `number` | `36` |
| `className` | `string` | — |

---

### Sk.Badge

Small inline badge/tag placeholder.

```tsx
<Sk.Badge />
<Sk.Badge width={64} />
```

| Prop | Type | Default |
|---|---|---|
| `width` | `number` | `60` |
| `height` | `number` | `20` |
| `className` | `string` | — |

---

### Sk.Number

Single-line numeric value placeholder. When generated, `height` is set to the element's `font-size` (visual bar) and `outerHeight` to the full bounding-box height (layout stability).

```tsx
<Sk.Number />
<Sk.Number width={60} />
<Sk.Number width={28} height="16px" outerHeight="24px" />  // auto-generated
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `80` | Width of the bar |
| `height` | `number \| string` | `'1em'` | Visual bar height (set to `font-size` by analyzer) |
| `outerHeight` | `string` | — | Outer container height for layout stability (set to bounding-box height by analyzer) |
| `className` | `string` | — | Extra CSS class |

---

### Sk.Icon

Square icon placeholder.

```tsx
<Sk.Icon />
<Sk.Icon size={24} />
```

| Prop | Type | Default |
|---|---|---|
| `size` | `number` | `24` |
| `className` | `string` | — |

---

### Sk.List

Repeating list of skeleton items.

```tsx
<Sk.List />                           // 3 items
<Sk.List count={5} gap={8} />
<Sk.List count={4} renderItem={() => (
  <div style={{ display: 'flex', gap: 8 }}>
    <Sk.Avatar size={32} />
    <Sk.Text width="70%" />
  </div>
)} />
```

| Prop | Type | Default |
|---|---|---|
| `count` | `number` | `3` |
| `gap` | `number` | `12` |
| `renderItem` | `() => ReactNode` | — |
| `className` | `string` | — |

---

### Sk.Card

Block container with optional padding and composable children.

```tsx
<Sk.Card>
  <Sk.Heading />
  <Sk.Text lines={2} />
</Sk.Card>

<Sk.Card width={320} height={200} />
```

| Prop | Type | Default |
|---|---|---|
| `width` | `string \| number` | `'100%'` |
| `height` | `string \| number` | — |
| `padding` | `number` | `16` |
| `children` | `ReactNode` | — |
| `className` | `string` | — |

---

## SkeletonWrapper

`SkeletonWrapper` is a client component that combines `Suspense` and `ErrorBoundary`. It shows a skeleton while its children suspend and falls back to the skeleton on error.

```tsx
import { SkeletonWrapper } from 'skeletal-ui'

// Explicit fallback (required for Server Components in Next.js App Router)
<SkeletonWrapper fallback={<UserCardSkeleton />}>
  <UserCard />
</SkeletonWrapper>

// CSR — explicit loading control
<SkeletonWrapper loading={!data} fallback={<UserCardSkeleton />}>
  <UserCard />
</SkeletonWrapper>

// Auto-resolved fallback (when Component.skeleton is set — works in client trees)
<SkeletonWrapper>
  <UserCard />
</SkeletonWrapper>
```

**Fallback resolution order:**
1. `fallback` prop (explicit — always wins)
2. `child.type.skeleton` — static property set via `lazyWithSkeleton` / `dynamicWithSkeleton`
3. `<DefaultPulseSkeleton />` — built-in full-width pulse bar

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | The component to render |
| `fallback` | `ReactNode` | — | Skeleton to show while loading |
| `loading` | `boolean` | — | Force skeleton display (CSR pattern — controls visibility without Suspense) |

---

## SkeletonProvider

Override the default pulse theme for a subtree using CSS custom properties.

```tsx
import { SkeletonProvider } from 'skeletal-ui'

<SkeletonProvider color="#e0e0e0" radius={8} duration={1.5}>
  <Dashboard />
</SkeletonProvider>
```

| Prop | Type | Default | CSS variable |
|---|---|---|---|
| `color` | `string` | `#e2e8f0` | `--sk-color` |
| `radius` | `number` | `4` | `--sk-radius` |
| `duration` | `number` | `2` | `--sk-duration` (seconds) |
| `children` | `ReactNode` | required | — |

You can also override these variables globally in your own CSS:

```css
:root {
  --sk-color: #e0e0e0;
  --sk-radius: 4px;
  --sk-duration: 1.5s;
}
```

---

## CLI reference

```
skeletal-ui init
```
Interactive setup. Creates `skeletal.config.ts`, walks through dev server URL and route selection, and prints the next steps including the Playwright install command.

---

```
skeletal-ui analyze [options]
```
The main command. Scans source files, crawls routes with Playwright (extracting bounding box, font-size, line-height, border-radius, and aspect-ratio for every element), generates `.skeleton.tsx` files, and wires them into your source.

| Flag | Description |
|---|---|
| `--no-browser` | Skip Playwright crawl. Uses AST classification only — generates structural skeletons without pixel-accurate sizing. |
| `--dry-run` | Print what would change without writing any files. |
| `--only <Name>` | Limit to a single component by name. |

---

```
skeletal-ui check [options]
```
Asserts that all skeleton files are up to date. Exits with code `1` if any skeleton is stale or missing. Use in CI to prevent skeleton drift.

| Flag | Description |
|---|---|
| `--json` | Output results as JSON for tooling integration. |

---

```
skeletal-ui watch
```
Watches for changes to component source files and re-runs `analyze` automatically.

---

```
skeletal-ui preview
```
Starts a local server that renders all generated skeletons side-by-side for visual review.

---

```
skeletal-ui eject <Name>
```
Copies a generated `.skeleton.tsx` into your source tree so you can edit it freely. Ejected files are marked with `skeletal:ejected` in their header and are never overwritten by future `analyze` runs.

---

## Configuration reference

```ts
// skeletal.config.ts
import { defineConfig } from 'skeletal-ui'

export default defineConfig({
  // Required
  devServer: 'http://localhost:3000',
  routes: ['/', '/dashboard', '/profile'],

  // Source files to scan (glob patterns)
  include: ['src/**/*.tsx'],           // default: ['src/**/*.tsx']
  exclude: ['**/*.test.tsx'],          // default: []

  // Output location for generated skeletons
  output: 'colocated',                 // 'colocated' | 'directory'
  outputDir: 'src/skeletons',          // only when output: 'directory'

  // Animation style
  animation: 'pulse',                 // 'pulse' | 'none'

  // Border radius for all primitives (px)
  radius: 6,

  // Viewport widths for the Playwright crawl
  breakpoints: [375, 768, 1280],

  // Auto-wire source files after generation
  autoWire: true,

  // Pattern toggles
  csr: { enabled: true },
  lazy: { enabled: true },
  dynamic: { enabled: true, detectStandalone: true },

  // Framework (auto-detected if not set)
  framework: 'nextjs',                // 'nextjs' | 'vite'

  // Max concurrent Playwright pages
  concurrency: 4,
})
```

### Route configuration

Routes can be plain strings or objects with params and auth state:

```ts
routes: [
  '/',
  '/dashboard',
  {
    path: '/profile/:id',
    params: { id: 'u_001' },
  },
  {
    path: '/admin',
    auth: 'path/to/auth-state.json',  // Playwright storageState file
  },
]
```

---

## Framework integrations

### Next.js

`skeletal-ui/next` exports `dynamicWithSkeleton` — safe to import in any page or component file:

```tsx
import { dynamicWithSkeleton } from 'skeletal-ui/next'

const Map = dynamicWithSkeleton(() => import('./Map'), { ssr: false })
```

The build-time marker transform (`skeletal-ui/next-transform`) is for `next.config.mjs` only. It injects `data-sk` attributes during the Playwright crawl phase:

```js
// next.config.mjs
import { skeletalNextTransform } from 'skeletal-ui/next-transform'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    if (process.env.SKELETAL_ANALYZE === '1') {
      config.module.rules.push({
        test: /\.tsx$/,
        use: [{ loader: skeletalNextTransform }],
      })
    }
    return config
  },
}

export default nextConfig
```

Then start your dev server with the flag:

```sh
SKELETAL_ANALYZE=1 next dev
```

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { skeletalVitePlugin } from 'skeletal-ui/vite'

export default defineConfig({
  plugins: [
    react(),
    skeletalVitePlugin(),
  ],
})
```

The Vite plugin activates only when `SKELETAL_ANALYZE=1` is set, so it has zero impact on normal dev and production builds.

---

## CI integration

Add `skeletal-ui check` to your CI pipeline to fail the build whenever skeletons drift from the source:

```yaml
# .github/workflows/check.yml
- name: Check skeletons
  run: npx skeletal-ui check
```

With JSON output for custom reporting:

```sh
skeletal-ui check --json
# {
#   "stale": [
#     { "name": "UserCard", "reason": "hash changed", "file": "src/components/UserCard.skeleton.tsx" }
#   ],
#   "upToDate": 4,
#   "total": 5
# }
```

Staleness is detected via an AST hash stored in each skeleton file's header comment:

```tsx
// skeletal:hash:a1b2c3d4
```

When the component's JSX structure changes, the hash changes, and `skeletal-ui check` reports the skeleton as stale.

---

## Requirements

| Dependency | Version |
|---|---|
| Node.js | `>= 18` |
| TypeScript | `>= 5.0` |
| React | `>= 18` |
| `@playwright/test` | `>= 1.44` _(optional — browser crawl only)_ |

skeletal-ui is **TypeScript-only**. JavaScript projects are not supported.

---

## License

MIT
