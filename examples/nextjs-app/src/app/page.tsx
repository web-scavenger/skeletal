import { SkeletonWrapper } from 'skeletal'
import { UserCard } from '../components/UserCard.js'
import { ProfileCard } from '../components/ProfileCard.js'
import { UserCardSkeleton } from "../components/UserCard.skeleton";
import { ProfileCardSkeleton } from "../components/ProfileCard.skeleton";

// Pattern 1 — RSC: UserCard is async, wrapped in SkeletonWrapper
// Pattern 2 — CSR: ProfileCard is non-async client component, wrapped in SkeletonWrapper

export default function HomePage() {
  return (
    <main>
      <h1>Home</h1>

      <section style={{ marginBottom: 32 }}>
        <h2>User profile (RSC — async Server Component)</h2>
        <SkeletonWrapper>
          <UserCard userId="u_001" />
        </SkeletonWrapper>
      </section>

      <section>
        <h2>Stats (CSR — client component with useEffect)</h2>
        <SkeletonWrapper>
          <ProfileCard username="janedoe" />
        </SkeletonWrapper>
      </section>
    </main>
  )
}

Object.assign(UserCard, { skeleton: UserCardSkeleton })

Object.assign(ProfileCard, { skeleton: ProfileCardSkeleton })
