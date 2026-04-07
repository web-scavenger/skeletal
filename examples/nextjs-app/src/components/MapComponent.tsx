'use client'
// Pattern 4 — dynamic: loaded via next/dynamic() (standalone — no SkeletonWrapper required)
// skeletal will detect the next/dynamic() call in dashboard/page.tsx

export function MapComponent({ location }: { location: string }) {
  return (
    <div className="map">
      <div className="map__placeholder">
        <span className="map__pin">📍</span>
        <p className="map__label">{location}</p>
      </div>
      <div className="map__tiles">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="map__tile" />
        ))}
      </div>
    </div>
  )
}
