import { useMemo, useState, useRef } from 'react'
import { Html, Image as DreiImage, Line } from '@react-three/drei'
import { Vector3, Euler, Matrix4, MathUtils, Group } from 'three'
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'

const MEMORY_COUNT = 10
const RADIUS = 6

// Sample Data (title only)
const MEMORY_DATA = [
    { title: "Our First Date", image: "first.jpg" },
    { title: "Late Night Talks", image: "" },
    { title: "The Adventure", image: "" },
    { title: "Quiet Moments", image: "" },
    { title: "Laughter", image: "" },
    { title: "Support", image: "" },
    { title: "Growth", image: "" },
    { title: "Dreams", image: "" },
    { title: "Home", image: "" },
    { title: "Forever", image: "" },
]

interface MemoryCardProps {
    position: [number, number, number]
    rotation: [number, number, number]
    index: number
    onClick: (index: number) => void
    active: boolean
    hasActive: boolean
    data: typeof MEMORY_DATA[0]
}

const MemoryCard = ({ position: initialPos, rotation: initialRot, index, onClick, active, hasActive, data }: MemoryCardProps) => {
    const groupRef = useRef<Group>(null)
    const [hovered, setHovered] = useState(false)

    // Animation Logic
    useFrame((state, delta) => {
        if (groupRef.current) {
            const t = delta * 4

            if (active) {
                // Focus Position - CENTERED for simplicity
                const targetPos = new Vector3(0, 0, 20)
                const targetRot = new Euler(0, 0, 0)
                const targetScale = 2.5 // Larger for focus

                groupRef.current.position.lerp(targetPos, t)
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, targetRot.x, t)
                groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, targetRot.y, t)
                groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, targetRot.z, t)
                groupRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), t)
            } else {
                // Return to Orbit
                const targetPos = new Vector3(...initialPos)
                if (hasActive) {
                    // slight dim or push back could go here
                }

                groupRef.current.position.lerp(targetPos, t)
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, initialRot[0], t)
                groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, initialRot[1], t)
                groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, initialRot[2], t)

                const targetScale = hovered ? 1.1 : 1.0
                groupRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), t)
            }
        }
    })

    return (
        <group ref={groupRef}>
            <mesh
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
                onPointerOut={(e) => setHovered(false)}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation()
                    onClick(active ? -1 : index)
                }}
            >
                <boxGeometry args={[1.5, 1, 0.05]} /> {/* Photo Frame Shape */}
                <meshStandardMaterial
                    color={active ? "#ffaacc" : (hovered ? "#ffffff" : "#ffddee")}
                    roughness={0.3}
                    metalness={0.4}
                    emissive={active ? "#ff88aa" : "#000000"}
                    emissiveIntensity={active ? 0.3 : 0}
                />
            </mesh>

            {/* Image or Placeholder */}
            {data.image ? (
                <DreiImage
                    url={data.image}
                    position={[0, 0, 0.03]}
                    scale={[1.4, 0.9, 1]}
                />
            ) : (
                <mesh position={[0, 0, 0.03]}>
                    <planeGeometry args={[1.4, 0.9]} />
                    <meshStandardMaterial color="#ffeeee" />
                </mesh>
            )}

            {/* Title Label Below Card - Animated Entrance */}
            {active && (
                <Html position={[0, -0.6, 0]} center>
                    <style>{`
                        @keyframes bounceIn {
                            0% { transform: scale(0) translateY(20px); opacity: 0; }
                            60% { transform: scale(1.1) translateY(-5px); opacity: 1; }
                            80% { transform: scale(0.95) translateY(2px); }
                            100% { transform: scale(1) translateY(0); }
                        }
                        @keyframes floatHeart {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-3px); }
                        }
                    `}</style>
                    <div style={{
                        fontFamily: "'Great Vibes', cursive",
                        fontSize: '2rem',
                        color: '#ffddee',
                        textShadow: `
                            0 0 10px rgba(255, 150, 200, 0.9),
                            0 0 20px rgba(255, 100, 150, 0.6),
                            0 2px 0 rgba(200, 100, 150, 0.3)
                        `,
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        animation: 'bounceIn 0.6s ease-out'
                    }}>
                        💕 {data.title} 💕
                    </div>
                    <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '0.75rem',
                        color: '#ccaabb',
                        marginTop: '10px',
                        textAlign: 'center',
                        letterSpacing: '2px',
                        animation: 'floatHeart 2s ease-in-out infinite'
                    }}>
                        ✨ TAP TO CLOSE ✨
                    </div>
                </Html>
            )}
        </group>
    )
}

interface FloatingMemoriesProps {
    onFocus?: (isFocused: boolean) => void
}

const FloatingMemories = ({ onFocus }: FloatingMemoriesProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    // Reset active index if clicking background (handled in parent usually, or we can use a global click handler)
    // For now, clicking an active card toggles it off.

    const memories = useMemo(() => {
        return new Array(MEMORY_COUNT).fill(0).map((_, i) => {
            // Distribute on a sphere/ring
            const phi = Math.acos(-1 + (2 * i) / MEMORY_COUNT)
            const theta = Math.sqrt(MEMORY_COUNT * Math.PI) * phi

            const x = RADIUS * Math.cos(theta) * Math.sin(phi)
            const y = RADIUS * Math.sin(theta) * Math.sin(phi)
            const z = RADIUS * Math.cos(phi)

            // Look at center
            const position = new Vector3(x, y, z)
            const rotation = new Euler()
            const matrix = new Matrix4()
            matrix.lookAt(position, new Vector3(0, 0, 0), new Vector3(0, 1, 0))
            rotation.setFromRotationMatrix(matrix)

            return {
                position: [x, y, z] as [number, number, number],
                rotation: [rotation.x, rotation.y, rotation.z] as [number, number, number]
            }
        })
    }, [])

    // Calculate specific webs connecting nearby points to form a stable ball structure
    const linePoints = useMemo(() => {
        const points: Vector3[] = []
        const vectorMemories = memories.map(m => new Vector3(...m.position))

        // Connect each point to its 3 nearest neighbors
        vectorMemories.forEach((current, i) => {
            // Calculate distances to all others
            const distances = vectorMemories.map((other, j) => ({
                index: j,
                dist: current.distanceTo(other)
            })).filter(d => d.index !== i)

            // Sort by distance
            distances.sort((a, b) => a.dist - b.dist)

            // Take closest 3
            distances.slice(0, 3).forEach(d => {
                // Avoid duplicate lines by only adding if current index < target index
                // Or just add them all, Line segments handles it. 
                // To prevent double drawing same line, we can check index.
                if (i < d.index) {
                    points.push(current)
                    points.push(vectorMemories[d.index])
                }
            })
        })
        return points
    }, [memories])

    return (
        <group>
            {/* Constellation Lines - Web/Ball Structure */}
            <Line
                points={linePoints}
                color="#ffaaee"
                lineWidth={1}
                opacity={0.2}
                transparent
                segments // Renders disjoint segments from pairs of points
            />

            {memories.map((props, i) => (
                <MemoryCard
                    key={i}
                    {...props}
                    index={i}
                    active={activeIndex === i}
                    hasActive={activeIndex !== null}
                    data={MEMORY_DATA[i % MEMORY_DATA.length]}
                    onClick={(idx) => {
                        const newActiveIndex = idx === -1 ? null : idx
                        setActiveIndex(newActiveIndex)
                        onFocus?.(newActiveIndex !== null)
                    }}
                />
            ))}
        </group>
    )
}

export default FloatingMemories
