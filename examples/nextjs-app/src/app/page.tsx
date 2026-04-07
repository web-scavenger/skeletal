import { SkeletonWrapper } from 'skeletal'
import { UserCard } from '../components/UserCard'
import { ProfileCard } from '../components/ProfileCard'
import { UserCardSkeleton } from '../components/UserCard.skeleton'
import { ProfileCardSkeleton } from '../components/ProfileCard.skeleton'

// Pattern 1 — RSC: UserCard is async, SkeletonWrapper auto-shows skeleton via fallback prop
// Pattern 2 — CSR: ProfileCard is non-async client component, same pattern

export default function HomePage() {
  return (
    <main>
      <h1>Home</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>User profile (RSC — async Server Component)</h2>
        <SkeletonWrapper fallback={<UserCardSkeleton />}>
          <UserCard userId="u_001" />
        </SkeletonWrapper>
      </section>

      <section>
        <h2>Stats (CSR — client component with useEffect)</h2>
        <SkeletonWrapper fallback={<ProfileCardSkeleton />}>
          <ProfileCard username="janedoe" />
        </SkeletonWrapper>
      </section>
    </main>
  )
}
