export const SK_PRIMITIVE_TYPES = {
  TEXT: 'Text',
  HEADING: 'Heading',
  AVATAR: 'Avatar',
  IMAGE: 'Image',
  BUTTON: 'Button',
  BADGE: 'Badge',
  NUMBER: 'Number',
  ICON: 'Icon',
  LIST: 'List',
  CARD: 'Card',
  UNKNOWN: 'Unknown',
} as const

export type SkPrimitiveType = typeof SK_PRIMITIVE_TYPES[keyof typeof SK_PRIMITIVE_TYPES]

export interface ClassifiedElement {
  primitiveType: SkPrimitiveType
  props: Record<string, unknown>
  relativeWidth: string
  children: ClassifiedElement[]
}

export type SkeletonTree = ClassifiedElement[]
