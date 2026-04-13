# Changelog

All notable changes to `skeletal-ui` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.0] — 2026-04-13

### Added

- **User-configurable sizes and constants** — three new optional config namespaces in `skeletal.config.ts`: `tailwind`, `classifier`, and `primitives`. All keys are optional and deep-merged with built-in defaults; existing configs parse without changes.

- **`tailwind` config namespace** — overrides the Tailwind font-size/line-height tables used during AST analysis. Keys: `fontSizePx` (map of class → px), `leading` (map of class → multiplier), `pairedLineHeightPx` (map of class → paired line-height px), `spacingUnit` (px per Tailwind spacing unit, default `4`), `textLengthThreshold` (char threshold for single-line `<p>` detection, default `80`). Useful for Tailwind v4 configs, custom theme extensions, or non-standard spacing scales.

- **`classifier` config namespace** — overrides geometry thresholds used to classify Playwright-measured DOM elements. Keys: `lineHeightEstimate`, `avatarSmallMax`, `iconMax`, `avatarMediumMax`, `badgeMaxHeight`, `badgeMaxWidth`, `textSingleLineMaxHeight`, `textMultiLineMinWidthRatio`, `imageMinDimension`, `imageAspectRatioMin`, `imageAspectRatioMax`. Useful when a design system uses dimensions outside the defaults (e.g. compact avatars, tall badges).

- **`primitives` config namespace** — overrides default prop values for all `Sk.*` components. Affects both code generation (generated files omit props that match the new default, keeping output clean) and runtime rendering (components read defaults from context when no explicit prop is passed). Per-component keys: `avatar`, `icon`, `button`, `badge`, `text`, `heading`, `image`, `card`, `list`, `defaultPulseSkeleton`.

- **`SkeletonProvider` — `primitives` prop** — runtime equivalent of the `primitives` config namespace. Wraps children with a React context so all `Sk.*` components in the subtree pick up the overridden defaults without any prop drilling.

- **`primitives/context.ts`** — new internal module exporting `SkeletalContext` and `useSkeletalContext`. All `Sk.*` primitives read from it; `SkeletonProvider` writes to it. Avoids circular imports between provider and primitives.

- **`resolveAstConstants(tailwind?)` factory** — exported from `ast-skeleton-generator`. Merges user `TailwindConfig` with built-in defaults; returned `AstConstants` object is threaded through all ~14 internal AST analysis helpers.

- **`resolveClassifierThresholds(cfg?)` factory** — exported from `classifier/rules`. Merges user `ClassifierConfig` with built-in defaults; returned `ClassifierThresholds` object is passed to `buildClassificationRules` and threaded through element classification.

- **`buildClassificationRules(thresholds)` factory** — replaces the static `CLASSIFICATION_RULES` array. Tag and geometry rules are now closures that read from the `thresholds` parameter instead of module-level constants.

- **`AstConstants`, `TailwindConfig`, `ClassifierConfig`, `PrimitivesConfig`** — new exported types for user autocomplete in `skeletal.config.ts` and `SkeletonProvider`.

- **Codegen default-elision** — `printSkeletonTree` / `printElement` accept an optional `primitivesConfig` and omit emitting props whose value equals the effective default (built-in or user-overridden). Keeps generated `.skeleton.tsx` files clean when primitive defaults are customised.

- **3 new codegen tests** — cover default-elision for `Text width="100%"`, `Avatar size={40}/shape="circle"`, and `primitivesConfig`-overridden defaults.

### Changed

- **All `Sk.*` primitives** — removed hardcoded default parameter values; props are now resolved via three-layer lookup: explicit prop → `SkeletonProvider` context → hardcoded default. Behaviour is identical when no `primitives` config or context is present.
- **`classify(geometry, thresholds?)`** — second parameter added; resolves and uses `buildClassificationRules` internally.
- **`generateSkeletonBodyFromSource` / `generateSkeletonBodyWithGeometry`** — optional `constants?: AstConstants` last parameter added; defaults to `resolveAstConstants()` when omitted.
- **`generateSkeleton`** — optional `primitivesConfig?: PrimitivesConfig` last parameter added; forwarded to `printSkeletonTree`.
- **`analyze` command** — resolves `astConstants` and `classifierThresholds` from config once at startup and threads them to all generation call sites.

---

## [0.7.0] — 2026-04-12

### Changed

- **`init` command — full interactive wizard overhaul**: replaced the minimal 3-question prompt with a fully guided wizard supporting **Quick** and **Advanced** modes. Quick mode asks only devServer URL, routes, and animation, then writes config and exits. Advanced mode additionally prompts for border radius, framework (if not auto-detected), and Playwright concurrency.
- **`init` — auto-detects framework and dev server port**: reads `package.json` deps/devDeps to detect `nextjs` or `vite`, and parses `scripts.dev` / `scripts.start` for `--port`/`-p` flags. Default port is `5173` for Vite, `3000` otherwise.
- **`init` — route discovery from disk**: scans the project's `src/app/`, `app/`, `src/pages/`, or `pages/` directories and presents discovered routes as a pre-selected multiselect checklist. App router strips route groups (`(group)` segments) and preserves dynamic segments (`[slug]`). Pages router excludes `api/`, `_app`, `_document`, `_error`. Detected routes can be deselected, and custom routes added via a free-text field.
- **`init` — config preview before write**: displays the full generated config via `clack.note()` and requires explicit confirmation before writing `skeletal.config.ts`.
- **`init` — `include`, `exclude`, `output` always written**: both Quick and Advanced configs now include `include: ['src/**/*.tsx']`, `exclude: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']`, and `output: 'colocated'` with their defaults. Previously these were omitted or hardcoded silently.
- **`init` — CSR/lazy/dynamic always enabled**: removed the multiselect that allowed toggling these patterns off. Advanced config always emits `csr`, `lazy`, and `dynamic` as enabled. The prompts added friction with no practical use case for disabling them.
- **Docs site — installation flow updated**: landing page now shows a 3-step flow (Install → Init → Analyze) replacing the previous Install → Configure → Init flow. The `init` step description and the example config block reflect the wizard's actual output.

### Added

- **`detect-project.ts`** — new pure utility (`detectProject(projectRoot): DetectedProject`) encapsulating framework detection, dev server URL synthesis, and route discovery. Fully testable with no clack dependency.
- **21 unit tests for `detectProject`**: cover framework detection (next/vite/none/no package.json), port extraction (defaults, `--port`, `-p`, start script fallback), app router discovery (root, nested, route groups, dynamic segments, `_` dir filtering, `src/app` precedence), pages router discovery (index, nested, `/index` stripping, api exclusion, `_` file exclusion), and no-router fallback.

---

## [0.6.0] — 2026-04-10

### Changed

- **Animation — shimmer → pulse**: replaced the horizontal gradient sweep (`skeletalShimmer`) with an opacity-based pulse (`skeletalPulse`: `opacity 1 → 0.4 → 1`). Easing updated to `cubic-bezier(0.4, 0, 0.6, 1)` and duration increased from `1.5s` to `2s`. Matches the feel of shadcn/ui `animate-pulse`. The `--sk-highlight` CSS variable has been removed (was only used by the shimmer gradient).
- **`SkeletonProvider` — removed `highlight` prop**: no longer needed after animation change. `color`, `radius`, and `duration` remain.
- **AST generator — `tailwindLeadingMultiplier` uses Tailwind paired line-heights**: previously fell back to a hardcoded `1.5` multiplier when no `leading-*` class was present. Now uses Tailwind's built-in font-size/line-height pairs (`text-xs` → 16px, `text-sm` → 20px, `text-lg` → 28px, etc.), matching the browser's computed `line-height` and eliminating height jumps for `<span>` elements in the AST-only path.
- **AST generator — `tailwindLeadingMultiplier` receives `inheritedTextClass`**: the `inheritedTextClass` parameter was passed to `tailwindFontSizePx` but not to `tailwindLeadingMultiplier`. Fixed so that child elements inheriting a parent's `text-*` class also inherit the correct paired line-height.

### Fixed

- **Layout jump on skeleton ↔ loaded toggle for `<span>` elements (AST-only path)**: caused by `lineHeight` being 18px for `text-xs` spans instead of the correct 16px. Root cause was the missing Tailwind paired line-height lookup (see Changed above).
- **`<p>` with short static text emitting `lines={2}`**: the AST-only path hardcoded `lines={2}` for every `<p>` tag. Now resolves the paragraph's text at analysis time — including property accesses on local `const` objects (e.g. `{POST.excerpt}`, even with `as const`) — and emits `lines={1}` when the resolved text is under 80 characters. Dynamic expressions that cannot be statically resolved still default to `lines={2}`.

---

## [0.5.0] — 2026-04-08

### Fixed

- **`Sk.Text` invisible in `align-items: center` flex containers**: `lineHeight` path now places `width` on the outer `<span>` instead of the inner bar. Previously `width: "100%"` on the inner bar created a circular CSS reference when the parent had no explicit cross-size (`flex-col items-center`, `flex items-center`), causing the element to render at 0px. Affects stat labels, footer metadata rows, and any text inside a centering flex container.
- **`<img>` with `rounded-full` generated as `Sk.Image` instead of `Sk.Avatar`**: `classifyLeafWithGeo` now checks `isCircularGeo` for `img` tags. Profile photos and small avatar images (e.g. `<img className="w-6 h-6 rounded-full">`) are correctly emitted as `Sk.Avatar`.
- **Gradient hero/banner divs generated as empty or wrong element**: `classifyNodeWithGeo` now detects `bg-gradient-*` divs taller than 40px and emits `Sk.Image` with the measured height. AST-only path (`classifyNode`) handles the same case via the `h-{n}` Tailwind class. Previously these containers produced empty output or descended into their decorative children.
- **Purely visual child containers (e.g. chart bars) silently dropped**: when all children of a container produce no skeleton output but the DOM has children and the element is larger than 20×20px, the container is now emitted as `Sk.Card` instead of being omitted. Preserves layout space for decorative elements.
- **`dynamicWithSkeleton` — `require is not defined` in browser bundles**: replaced `require('next/dynamic')` with a static ESM `import` and `@ts-ignore`. The previous dynamic `require()` call failed in browser ESM environments.

### Changed

- **AST generator — single-line text width uses pixels**: `classifyLeafWithGeo` now emits absolute pixel widths (e.g. `width="68px"`) for single-line `Sk.Text` instead of percentages. Percentage widths resolve to zero when the flex parent has no explicit width (intrinsic-width `flex items-center` containers). Multi-line text retains percentage widths as it is always inside block/stretch containers.

### Added

- **`package.json` — `homepage`, `repository`, `bugs`**: npm package page now links to the live demo (`https://web-scavenger.github.io/skeletal/`) and the GitHub repository.

---

## [0.2.0] — 2026-04-08

### Added

- **`Sk.Text` — `lineHeight` prop**: outer container height for single-line text. When set by the analyzer, the element takes up the same vertical space as the real element (computed `line-height`) while the inner bar stays at `font-size` height. Eliminates height jump on skeleton ↔ loaded toggle.
- **`Sk.Text` — `gap` prop**: controls the gap between bars in multi-line mode. The analyzer computes this so that `lines × barHeight + (lines − 1) × gap = boundingBox.height` — total skeleton height matches real element exactly.
- **`Sk.Heading` — `height` prop**: overrides the fixed `1.4em` default. The analyzer sets this to the element's actual bounding-box height, so multi-line headings (e.g. a wrapping `<h3>`) are represented at the correct height.
- **`Sk.Number` — `outerHeight` prop**: outer container height for layout stability (same wrapper pattern as `Sk.Text` `lineHeight`). Analyzer sets it to the bounding-box height; visual bar stays at `font-size`.
- **Playwright geometry — `fontSize` + `lineHeight`**: `extractChildGeometryScript` and `normalizeChildGeometry` now capture `styles.fontSize` and `styles.lineHeight` alongside the existing `borderRadius` and `aspectRatio`. These are site-specific computed values resolved through the project's Tailwind config and custom CSS.
- **AST generator — geo-based avatar detection (`isCircularGeo`)**: detects avatars from computed `border-radius` (≥ 45% of min dimension or exactly `50%`) rather than relying solely on `rounded-full` class names. Fixes detection when `className` is a template literal.
- **AST generator — geo-based image detection (`isImageShapedGeo`)**: detects image-shaped containers from computed `aspect-ratio`. Emits `Sk.Image` for `aspect-video` / `aspect-square` divs and any element where the browser reports a non-`auto` aspect ratio.
- **AST generator — `aspect-*` → `Sk.Image` rule (AST-only path)**: `classifyNode` now maps `aspect-video` → `aspectRatio="16/9"`, `aspect-square` → `aspectRatio="1/1"` before descending into children.
- **AST generator — template literal `className` support**: `getClassAttr` and `getClassFromOpeningOrSelfClosing` now extract static class tokens from `` className={`...${expr}...`} `` by stripping interpolations. Fixes avatar/image/text classification for components with dynamic class fragments.
- **AST generator — `hasOnlyInlineChildren`**: replaces `hasOnlyLeafChildren`. Treats `<span>`, `<strong>`, `<em>`, `<b>`, `<i>`, `<a>`, `<code>`, `<small>`, `<mark>`, `<label>` as inline, so `<p><span>bold</span> text</p>` collapses to a single `Sk.Text` instead of producing nested skeleton elements.
- **AST generator — spacing class preservation**: `extractSpacingClasses` extracts `mt-*`, `mb-*`, `mx-*`, `my-*`, `pt-*`, `pb-*`, etc. from text elements and passes them as `className` on `Sk.Text`. Preserves inter-element gaps (e.g. `mt-1` between paragraph lines) in generated skeletons.

### Changed

- **`Sk.Text` multi-line `className`**: moved from each inner bar to the outer flex wrapper. Margin/spacing classes now apply to the container as expected.
- **AST generator — `Sk.Text` bar height**: changed from `lineHeight` to `fontSize` (Playwright-extracted). Bars now look visually proportional to real text instead of spanning the full line-height slot.
- **AST generator — `Sk.Number` height**: changed from bounding-box height (`h`) to `fontSize`. Visual bar matches the font size; `outerHeight` preserves layout.
- **AST generator — `classifyNodeWithGeo` heading**: uses bounding-box `h` for `Sk.Heading height`, replacing the hardcoded `1.4em` fallback.
- **AST generator — `classifyNodeWithGeo` avatar priority**: `isCircularGeo` check runs before `isAvatarDiv` so Playwright computed styles take precedence over class-name heuristics.

### Fixed

- Height jump when toggling skeleton ↔ loaded for single-line text elements (`lineHeight` wrapper).
- Height jump for numeric stat blocks (`outerHeight` wrapper on `Sk.Number`).
- Skeleton overall height taller than real content for multi-line text (gap overflow fixed by explicit `gap` prop computation).
- Avatar missing from components using template-literal `className` (e.g. `` className={`rounded-full ${color}`} ``).
- `aspect-video` image areas generating `Sk.Text` bars instead of `Sk.Image`.
- `<p><span>` inline patterns generating separate `Sk.Text` per span instead of one bar per paragraph.

---

## [0.1.0] — 2026-03-01

Initial release.

### Added

- CLI: `init`, `analyze`, `check`, `watch`, `preview`, `eject` commands.
- Playwright crawler: bounding-box and `border-radius` / `aspect-ratio` geometry extraction.
- AST scanner: RSC / CSR / lazy / dynamic pattern detection via ts-morph.
- Code generator: co-located `.skeleton.tsx` output with `Sk.*` primitives.
- Codemod: auto-wires `fallback` prop and `lazyWithSkeleton` / `dynamicWithSkeleton` replacements.
- Primitives: `Sk.Text`, `Sk.Heading`, `Sk.Avatar`, `Sk.Image`, `Sk.Button`, `Sk.Badge`, `Sk.Number`, `Sk.Icon`, `Sk.List`, `Sk.Card`.
- `SkeletonWrapper`, `SkeletonProvider`, `DefaultPulseSkeleton`.
- `lazyWithSkeleton` (runtime), `dynamicWithSkeleton` (Next.js), Vite plugin.
- CSS-only pulse animation with `prefers-reduced-motion` support.
- AST hash staleness detection (`skeletal:hash` header comment).
- `skeletal.config.ts` with `defineConfig()` and Zod schema validation.

[0.8.0]: https://github.com/web-scavenger/skeletal/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/web-scavenger/skeletal/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/web-scavenger/skeletal/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/web-scavenger/skeletal/compare/v0.2.0...v0.5.0
[0.2.0]: https://github.com/web-scavenger/skeletal/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/web-scavenger/skeletal/releases/tag/v0.1.0
