import { useMemo, useState, useRef, useEffect } from 'react'
import { Html, Image as DreiImage, Line } from '@react-three/drei'
import { Vector3, Euler, Matrix4, MathUtils, Group } from 'three'
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'

const MEMORY_COUNT = 10
const RADIUS = 6

// Sample Data (placeholder)
const MEMORY_DATA = [
    { title: "First Spark", description: "The moment we met. It felt like the stars aligned just for us.", image: "" },
    { title: "Late Night Talks", description: "Talking until 3AM about everything and nothing. Time stood still.", image: "zaq.jpg" },
    { title: "The Adventure", description: "That trip we took into the unknown. Just us against the world.", image: "" },
    { title: "Quiet Moments", description: "Sitting in silence, comfortable and warm. No words needed.", image: "" },
    { title: "Laughter", description: "The kind of laughter that hurts your stomach. Pure joy.", image: "" },
    { title: "Support", description: "You were there when I fell, ready to pick me up.", image: "" },
    { title: "Growth", description: "Watching each other change and become better versions of ourselves.", image: "" },
    { title: "Dreams", description: "Sharing our wildest hopes for the future.", image: "" },
    { title: "Home", description: "Realizing that home isn't a place, it's a person.", image: "" },
    { title: "Forever", description: "Looking forward to a thousand more memories like these.", image: "" },
]

interface MemoryCardProps {
    position: [number, number, number]
    rotation: [number, number, number]
    index: number
    onClick: (index: number) => void
    active: boolean
    hasActive: boolean // True if ANY card is active
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
                // Focus Position (Left side, close to camera, facing front)
                // Camera is at (0, 0, 25). Placing card at Z=20 makes it 5 units away (very close).
                // Shift X slightly left to offset the center.
                const targetPos = new Vector3(-1.5, 0, 20)
                const targetRot = new Euler(0, 0, 0)
                const targetScale = 2.0 // Significantly larger

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
                    color={active ? "#ffaa00" : (hovered ? "#ffffff" : "#cccccc")}
                    roughness={0.2}
                    metalness={0.5}
                    emissive={active ? "#ffaa00" : "#000000"}
                    emissiveIntensity={active ? 0.2 : 0}
                />
            </mesh>

            {/* Image Placeholder */}
            {data.image && (
                <DreiImage
                    url={data.image}
                    position={[0, 0, 0.03]}
                    scale={[1.4, 0.9, 1]}
                />
            )}
            {!data.image && (
                // Placeholder grey plane if no image
                <mesh position={[0, 0, 0.03]}>
                    <planeGeometry args={[1.4, 0.9]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            )}
        </group>
    )
}

// Typing Effect Component
const TypewriterText = ({ text, active }: { text: string, active: boolean }) => {
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        if (active) {
            let i = 0
            setDisplayedText('')
            const interval = setInterval(() => {
                setDisplayedText(text.slice(0, i + 1))
                i++
                if (i > text.length) clearInterval(interval)
            }, 100) // Speed of typing
            return () => clearInterval(interval)
        } else {
            setDisplayedText('')
        }
    }, [text, active])

    return <span>{displayedText}</span>
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

            {/* UI Overlay for Details */}
            {activeIndex !== null && (
                <Html fullscreen style={{ pointerEvents: 'none' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10%',
                        transform: 'translateY(-50%)',
                        width: '350px',
                        padding: '2.5rem',
                        background: 'rgba(20, 5, 10, 0.7)', // darker rose tint
                        border: '1px solid rgba(255, 100, 150, 0.3)', // Pinkish gold border
                        boxShadow: '0 0 30px rgba(255, 50, 100, 0.2)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '24px',
                        color: 'white',
                        fontFamily: "'Playfair Display', serif",
                        textAlign: 'center', // Centered for more poetic feel
                        pointerEvents: 'auto',
                        animation: 'fadeInSlide 0.8s ease-out'
                    }}>
                        <style>{`
                            @keyframes fadeInSlide {
                                from { opacity: 0; transform: translate(30px, -50%); }
                                to { opacity: 1; transform: translate(0, -50%); }
                            }
                        `}</style>
                        <h2 style={{
                            marginTop: 0,
                            fontFamily: "'Great Vibes', cursive",
                            color: '#ff99bb', // Soft Pink
                            fontSize: '3.5rem',
                            fontWeight: 'normal',
                            marginBottom: '1rem',
                            textShadow: '0 0 10px rgba(255, 100, 150, 0.5)'
                        }}>
                            {MEMORY_DATA[activeIndex % MEMORY_DATA.length].title}
                        </h2>
                        <div style={{
                            width: '50px',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #ff99bb, transparent)',
                            margin: '0 auto 1.5rem auto'
                        }} />
                        <p style={{
                            lineHeight: '1.8',
                            fontSize: '1.2rem',
                            color: '#fff0f5',
                            minHeight: '60px',
                            fontStyle: 'italic'
                        }}>
                            "<TypewriterText text={MEMORY_DATA[activeIndex % MEMORY_DATA.length].description} active={true} />"
                        </p>
                        <div style={{
                            marginTop: '2rem',
                            fontSize: '0.9rem',
                            color: '#aa8899',
                            fontFamily: 'sans-serif',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Click card to close
                        </div>
                    </div>
                </Html>
            )}
        </group>
    )
}

export default FloatingMemories
