import { z } from 'zod'

const routeConfigSchema = z.object({
  path: z.string(),
  params: z.record(z.string()).optional(),
  auth: z.string().optional(),
})

const tailwindConfigSchema = z.object({
  fontSizePx: z.record(z.string(), z.number()).optional(),
  leading: z.record(z.string(), z.number()).optional(),
  pairedLineHeightPx: z.record(z.string(), z.number()).optional(),
  spacingUnit: z.number().positive().optional(),
  textLengthThreshold: z.number().int().positive().optional(),
}).optional()

const classifierConfigSchema = z.object({
  lineHeightEstimate: z.number().positive().optional(),
  avatarSmallMax: z.number().positive().optional(),
  iconMax: z.number().positive().optional(),
  avatarMediumMax: z.number().positive().optional(),
  badgeMaxHeight: z.number().positive().optional(),
  badgeMaxWidth: z.number().positive().optional(),
  textSingleLineMaxHeight: z.number().positive().optional(),
  textMultiLineMinWidthRatio: z.number().min(0).max(1).optional(),
  imageMinDimension: z.number().positive().optional(),
  imageAspectRatioMin: z.number().positive().optional(),
  imageAspectRatioMax: z.number().positive().optional(),
}).optional()

const primitivesConfigSchema = z.object({
  avatar: z.object({ size: z.number().positive().optional(), shape: z.enum(['circle', 'square']).optional() }).optional(),
  icon: z.object({ size: z.number().positive().optional() }).optional(),
  button: z.object({ width: z.union([z.string(), z.number()]).optional(), height: z.number().positive().optional() }).optional(),
  badge: z.object({ width: z.number().positive().optional(), height: z.number().positive().optional() }).optional(),
  text: z.object({ lines: z.number().int().positive().optional(), lastLineWidth: z.string().optional(), gap: z.string().optional(), height: z.string().optional() }).optional(),
  heading: z.object({ width: z.string().optional(), height: z.string().optional() }).optional(),
  image: z.object({ aspectRatio: z.string().optional() }).optional(),
  card: z.object({ padding: z.number().min(0).optional() }).optional(),
  list: z.object({ count: z.number().int().positive().optional(), gap: z.number().min(0).optional() }).optional(),
  defaultPulseSkeleton: z.object({ height: z.union([z.string(), z.number()]).optional() }).optional(),
}).optional()

export const skeletalConfigSchema = z.object({
  devServer: z.string().url(),
  routes: z.array(z.union([z.string(), routeConfigSchema])).default([]),
  include: z.array(z.string()).default(['src/**/*.tsx']),
  exclude: z.array(z.string()).default(['**/*.test.*', '**/*.spec.*', '**/node_modules/**']),
  output: z.enum(['colocated', 'directory']).default('colocated'),
  outputDir: z.string().optional(),
  animation: z.enum(['shimmer', 'pulse', 'none']).default('shimmer'),
  radius: z.number().int().min(0).default(6),
  breakpoints: z.array(z.number().int().positive()).default([375, 768, 1280]),
  autoWire: z.boolean().default(true),
  csr: z.object({ enabled: z.boolean().default(true) }).default({ enabled: true }),
  lazy: z.object({ enabled: z.boolean().default(true) }).default({ enabled: true }),
  dynamic: z.object({
    enabled: z.boolean().default(true),
    detectStandalone: z.boolean().default(true),
  }).default({ enabled: true, detectStandalone: true }),
  framework: z.enum(['nextjs', 'vite']).optional(),
  concurrency: z.number().int().positive().default(4),
  tailwind: tailwindConfigSchema,
  classifier: classifierConfigSchema,
  primitives: primitivesConfigSchema,
})
