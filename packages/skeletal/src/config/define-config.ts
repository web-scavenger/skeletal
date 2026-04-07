import type { SkeletalConfig } from './types.js'

type PartialSkeletalConfig = Partial<SkeletalConfig> & { devServer: string }

export function defineConfig(config: PartialSkeletalConfig): PartialSkeletalConfig {
  return config
}
