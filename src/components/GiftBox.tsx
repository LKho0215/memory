import { useRef, useState } from 'react'
import { useCursor, Html } from '@react-three/drei'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Group, MathUtils, Mesh, BoxGeometry } from 'three'

interface GiftBoxProps {
    onOpen?: (isOpen: boolean) => void
}

const GiftBox = ({ onOpen }: GiftBoxProps) => {
    const [hovered, setHovered] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // Refs for animation
    const boxRef = useRef<Group>(null)
    const lidRef = useRef<Group>(null)
    const lightBallRef = useRef<Mesh>(null)

    useCursor(hovered)

    useFrame((state, delta) => {
        // Bouncy Hover + Breathing Animation
        if (boxRef.current) {
            const time = state.clock.elapsedTime

            // Breathing effect (gentle scale pulse)
            const breathe = 1 + Math.sin(time * 2) * 0.02

            // Hover bounce (spring-like wobble)
            const targetScale = hovered ? 1.1 : 1.0
            const currentScale = boxRef.current.scale.x / breathe
            const newScale = MathUtils.lerp(currentScale, targetScale, delta * 8)

            boxRef.current.scale.setScalar(newScale * breathe)

            // Cute wobble on hover
            if (hovered) {
                boxRef.current.rotation.z = Math.sin(time * 8) * 0.05
                boxRef.current.rotation.x = Math.cos(time * 6) * 0.03
            } else {
                boxRef.current.rotation.z = MathUtils.lerp(boxRef.current.rotation.z, 0, delta * 5)
                boxRef.current.rotation.x = MathUtils.lerp(boxRef.current.rotation.x, 0, delta * 5)
            }
        }

        // Animate Lid
        if (lidRef.current) {
            const targetRotation = isOpen ? -2.2 : 0
            lidRef.current.rotation.x = MathUtils.lerp(lidRef.current.rotation.x, targetRotation, delta * 3)
        }

        // Animate Light Ball Rising
        if (lightBallRef.current) {
            const targetY = isOpen ? 1.0 : -0.2
            lightBallRef.current.position.y = MathUtils.lerp(lightBallRef.current.position.y, targetY, delta * 2)

            const targetScale = isOpen ? 1 : 0.1
            const currentScale = lightBallRef.current.scale.x
            const newScale = MathUtils.lerp(currentScale, targetScale, delta * 2)
            lightBallRef.current.scale.setScalar(newScale)
        }
    })

    const handleConfirmOpen = () => {
        const newState = !isOpen
        setIsOpen(newState)
        setShowConfirm(false)
        onOpen?.(newState)
    }

    const boxColor = "#ffaaaa" // Cuter pastel pink
    const ribbonColor = "#ffdd88" // Soft gold
    const borderColor = "#444444" // Soft dark border

    // Dimensions
    const t = 0.1
    const w = 1.6
    const h = 1.0
    const d = 1.6

    // Cute box with edge lines
    const CuteBox = ({ args, position, color }: { args: [number, number, number], position: [number, number, number], color: string }) => (
        <group position={position}>
            <mesh>
                <boxGeometry args={args} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Black outline edges */}
            <lineSegments>
                <edgesGeometry args={[new BoxGeometry(...args)]} />
                <lineBasicMaterial color={borderColor} />
            </lineSegments>
        </group>
    )

    return (
        <group
            ref={boxRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                if (!isOpen) {
                    setShowConfirm(true)
                } else {
                    setIsOpen(false)
                    onOpen?.(false)
                }
            }}
            position={[0, -0.5, 0]}
        >
            {/* HOLLOW BOX CONSTRUCTION - Cute Pastel Pink with Black Borders */}
            {/* Floor */}
            <CuteBox args={[w, t, d]} position={[0, -h / 2 + t / 2, 0]} color={boxColor} />
            {/* Front Wall */}
            <CuteBox args={[w, h, t]} position={[0, 0, d / 2 - t / 2]} color={boxColor} />
            {/* Back Wall */}
            <CuteBox args={[w, h, t]} position={[0, 0, -d / 2 + t / 2]} color={boxColor} />
            {/* Left Wall */}
            <CuteBox args={[t, h, d - 2 * t]} position={[-w / 2 + t / 2, 0, 0]} color={boxColor} />
            {/* Right Wall */}
            <CuteBox args={[t, h, d - 2 * t]} position={[w / 2 - t / 2, 0, 0]} color={boxColor} />

            {/* Vertical Ribbon on Front */}
            <mesh position={[0, 0, d / 2 + 0.01]} scale={[0.2, 1, 0.05]}>
                <boxGeometry args={[1, h, 1]} />
                <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.3} />
            </mesh>

            {/* THE RISING LIGHT BALL - Cute Heart Glow */}
            <mesh ref={lightBallRef} position={[0, -0.2, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial
                    color="#fff"
                    emissive="#ffaacc"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
                <pointLight distance={3} intensity={isOpen ? 1 : 0} color="#ffaacc" decay={2} />
            </mesh>

            {/* ROTATING LID - with rounded feel */}
            <group position={[0, h / 2, -d / 2]} ref={lidRef}>
                <group position={[0, 0, d / 2]}>
                    <CuteBox args={[w + 0.1, t, d + 0.1]} position={[0, t / 2, 0]} color={boxColor} />

                    {/* Ribbons on Lid */}
                    <mesh position={[0, t / 2 + 0.01, 0]}>
                        <boxGeometry args={[w + 0.12, t, 0.3]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, t / 2 + 0.01, 0]}>
                        <boxGeometry args={[0.3, t, d + 0.12]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.3} />
                    </mesh>

                    {/* Cute Bow - Rounder */}
                    <mesh position={[0, t + 0.2, 0]}>
                        <sphereGeometry args={[0.25, 16, 16]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.3} />
                    </mesh>
                    <mesh position={[-0.2, t + 0.15, 0]} rotation={[0, 0, 0.5]}>
                        <sphereGeometry args={[0.15, 12, 12]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.3} />
                    </mesh>
                    <mesh position={[0.2, t + 0.15, 0]} rotation={[0, 0, -0.5]}>
                        <sphereGeometry args={[0.15, 12, 12]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.3} />
                    </mesh>
                </group>
            </group>

            {/* Confirmation Dialog */}
            {showConfirm && (
                <Html center>
                    <div style={{
                        background: 'rgba(255, 240, 245, 0.95)',
                        border: '3px solid #ff99bb',
                        borderRadius: '20px',
                        padding: '20px 30px',
                        textAlign: 'center',
                        fontFamily: "'Playfair Display', serif",
                        boxShadow: '0 8px 32px rgba(255, 100, 150, 0.3)',
                        minWidth: '200px'
                    }}>
                        <p style={{
                            margin: '0 0 15px 0',
                            color: '#aa5577',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}>
                            Open this gift? 🎁
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleConfirmOpen()
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #ff99bb, #ffaacc)',
                                    border: '2px solid #ff88aa',
                                    borderRadius: '12px',
                                    padding: '8px 20px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                Yes! 💖
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowConfirm(false)
                                }}
                                style={{
                                    background: '#eee',
                                    border: '2px solid #ccc',
                                    borderRadius: '12px',
                                    padding: '8px 20px',
                                    color: '#666',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                Not yet
                            </button>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    )
}

export default GiftBox
