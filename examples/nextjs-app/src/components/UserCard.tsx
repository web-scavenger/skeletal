// Pattern 1 — RSC: async Server Component
// skeletal will detect: async function + SkeletonWrapper usage in page.tsx

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  bio: string
}

async function getUser(id: string): Promise<User> {
  // Simulate a slow data fetch
  await new Promise(r => setTimeout(r, 800))
  return {
    id,
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    bio: 'Product designer and occasional developer. Loves good typography and dark mode.',
  }
}

export async function UserCard({ userId }: { userId: string }) {
  const user = await getUser(userId)

  return (
    <div className="user-card">
      <img
        src={user.avatarUrl}
        alt={user.name}
        width={64}
        height={64}
        className="user-card__avatar"
      />
      <div className="user-card__body">
        <h2 className="user-card__name">{user.name}</h2>
        <p className="user-card__email">{user.email}</p>
        <p className="user-card__bio">{user.bio}</p>
      </div>
      <button className="user-card__follow">Follow</button>
    </div>
  )
}
