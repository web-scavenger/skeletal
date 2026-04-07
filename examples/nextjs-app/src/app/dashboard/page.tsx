'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { SkeletonWrapper, lazyWithSkeleton } from 'skeletal'
import { dynamicWithSkeleton } from 'skeletal/next'

// Pattern 3 — lazy: React.lazy() inside SkeletonWrapper
const HeavyChart = lazyWithSkeleton(() => import('../../components/HeavyChart'))

// Pattern 4 — dynamic: next/dynamic() standalone (no SkeletonWrapper needed for detection)
const MapComponent = dynamicWithSkeleton(
  () => import('../../components/MapComponent'),
  { ssr: false },
)

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>Revenue chart (React.lazy)</h2>
        <SkeletonWrapper>
          <HeavyChart title="Monthly Revenue" />
        </SkeletonWrapper>
      </section>

      <section>
        <h2>Location map (next/dynamic — CSR only)</h2>
        <MapComponent location="San Francisco, CA" />
      </section>
    </main>
  )
}
