// Public API entry point for the 'skeletal' package

// Runtime components
export { SkeletonWrapper } from './primitives/SkeletonWrapper.js'
export type { SkeletonWrapperProps } from './primitives/SkeletonWrapper.js'

export { SkeletonProvider } from './primitives/SkeletonProvider.js'
export type { SkeletonProviderProps } from './primitives/SkeletonProvider.js'

export { DefaultPulseSkeleton } from './primitives/DefaultPulseSkeleton.js'
export type { DefaultPulseSkeletonProps } from './primitives/DefaultPulseSkeleton.js'

// Lazy wrapper
export { lazyWithSkeleton } from './runtime/lazy-with-skeleton.js'

// Config
export { defineConfig } from './config/define-config.js'
export type { SkeletalConfig, RouteConfig } from './config/types.js'

// Sk.* namespace
import { Text } from './primitives/Text.js'
import { Heading } from './primitives/Heading.js'
import { Avatar } from './primitives/Avatar.js'
import { Image } from './primitives/Image.js'
import { Button } from './primitives/Button.js'
import { Badge } from './primitives/Badge.js'
import { Number } from './primitives/Number.js'
import { Icon } from './primitives/Icon.js'
import { List } from './primitives/List.js'
import { Card } from './primitives/Card.js'

export const Sk = {
  Text,
  Heading,
  Avatar,
  Image,
  Button,
  Badge,
  Number,
  Icon,
  List,
  Card,
} as const
