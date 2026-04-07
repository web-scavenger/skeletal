import { z } from 'zod'

const routeConfigSchema = z.object({
  path: z.string(),
  params: z.record(z.string()).optional(),
  auth: z.string().optional(),
})

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
})
