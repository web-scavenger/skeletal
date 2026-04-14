'use client'

import { Sk } from 'skeletal-ui'

interface ShowcaseBoxProps {
  label?: string
  children: React.ReactNode
}

function ShowcaseBox({ label, children }: ShowcaseBoxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{label}</span>
      )}
      <div className="flex items-center justify-start px-4 py-4 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 min-h-[60px]">
        {children}
      </div>
    </div>
  )
}

interface PreviewGridProps {
  children: React.ReactNode
}

export function PreviewGrid({ children }: PreviewGridProps) {
  return (
    <div className="my-6 rounded-xl border border-gray-200 dark:border-neutral-800 p-5">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
        Live preview
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

export function TextShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Text />">
        <div style={{ width: '100%' }}>
          <Sk.Text />
        </div>
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.Text lines={3} />">
        <div style={{ width: '100%' }}>
          <Sk.Text lines={3} />
        </div>
      </ShowcaseBox>
      <ShowcaseBox label='<Sk.Text lines={3} lastLineWidth="40%" />'>
        <div style={{ width: '100%' }}>
          <Sk.Text lines={3} lastLineWidth="40%" />
        </div>
      </ShowcaseBox>
      <ShowcaseBox label='<Sk.Text height="14px" lineHeight="20px" width="200px" />'>
        <Sk.Text height="14px" lineHeight="20px" width="200px" />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function HeadingShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Heading />">
        <div style={{ width: '100%' }}>
          <Sk.Heading />
        </div>
      </ShowcaseBox>
      <ShowcaseBox label='<Sk.Heading width="50%" />'>
        <Sk.Heading width="50%" />
      </ShowcaseBox>
      <ShowcaseBox label='<Sk.Heading height="42px" width="88%" />'>
        <Sk.Heading height="42px" width="88%" />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function AvatarShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Avatar />">
        <Sk.Avatar />
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.Avatar size={64} />">
        <Sk.Avatar size={64} />
      </ShowcaseBox>
      <ShowcaseBox label='<Sk.Avatar size={48} shape="square" />'>
        <Sk.Avatar size={48} shape="square" />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function ImageShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Image /> — 16/9, full width">
        <div style={{ width: '100%' }}>
          <Sk.Image />
        </div>
      </ShowcaseBox>
      <ShowcaseBox label='<Sk.Image aspectRatio="4/3" width="50%" />'>
        <Sk.Image aspectRatio="4/3" width="50%" />
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.Image width={200} height={120} />">
        <Sk.Image width={200} height={120} />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function ButtonShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Button />">
        <Sk.Button />
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.Button width={200} height={44} />">
        <Sk.Button width={200} height={44} />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function BadgeShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Badge />">
        <Sk.Badge />
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.Badge width={90} />">
        <Sk.Badge width={90} />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function NumberShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Number />">
        <Sk.Number />
      </ShowcaseBox>
      <ShowcaseBox label='<Sk.Number width={40} height="20px" outerHeight="28px" />'>
        <Sk.Number width={40} height="20px" outerHeight="28px" />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function IconShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Icon />">
        <Sk.Icon />
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.Icon size={40} />">
        <Sk.Icon size={40} />
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function ListShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.List renderItem={() => <Sk.Text />} />">
        <div style={{ width: '100%' }}>
          <Sk.List renderItem={() => <Sk.Text />} />
        </div>
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.List count={4} gap={16} renderItem={() => <Sk.Text />} />">
        <div style={{ width: '100%' }}>
          <Sk.List count={4} gap={16} renderItem={() => <Sk.Text />} />
        </div>
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.List renderItem={() => <Avatar + Text />} />">
        <div style={{ width: '100%' }}>
          <Sk.List count={3} gap={12} renderItem={() => (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Sk.Avatar size={32} />
              <Sk.Text width="140px" />
            </div>
          )} />
        </div>
      </ShowcaseBox>
    </PreviewGrid>
  )
}

export function CardShowcase() {
  return (
    <PreviewGrid>
      <ShowcaseBox label="<Sk.Card> with children">
        <div style={{ width: '100%' }}>
          <Sk.Card>
            <Sk.Heading width="60%" />
            <Sk.Text lines={2} />
            <Sk.Button />
          </Sk.Card>
        </div>
      </ShowcaseBox>
      <ShowcaseBox label="<Sk.Card width={280} height={120} />">
        <Sk.Card width={280} height={120} />
      </ShowcaseBox>
    </PreviewGrid>
  )
}
