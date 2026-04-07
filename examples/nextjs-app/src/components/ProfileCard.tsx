'use client'
// Pattern 2 — CSR: plain (non-async) client component using React state
// skeletal will detect: non-async function + SkeletonWrapper usage in page.tsx

import { useState, useEffect } from 'react'

interface Stats {
  followers: number
  following: number
  posts: number
}

export function ProfileCard({ username }: { username: string }) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    // Simulate fetching stats client-side (React Query / SWR pattern)
    setTimeout(() => {
      setStats({ followers: 1240, following: 89, posts: 47 })
    }, 600)
  }, [username])

  if (!stats) return null

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <div className="profile-card__avatar" />
        <h3 className="profile-card__name">@{username}</h3>
      </div>
      <div className="profile-card__stats">
        <span className="profile-card__stat">
          <strong>{stats.followers}</strong> followers
        </span>
        <span className="profile-card__stat">
          <strong>{stats.following}</strong> following
        </span>
        <span className="profile-card__stat">
          <strong>{stats.posts}</strong> posts
        </span>
      </div>
    </div>
  )
}
