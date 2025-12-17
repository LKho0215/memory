import { useRef, useState } from 'react'
import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Mesh } from 'three'

interface GiftBoxProps {
    onOpen?: (isOpen: boolean) => void
}

const GiftBox = ({ onOpen }: GiftBoxProps) => {
    const [hovered, setHovered] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Refs for animation
    const lidRef = useRef<Group>(null)
    const lightBallRef = useRef<Mesh>(null)

    useCursor(hovered)

    useFrame((state, delta) => {
        // Animate Lid
        if (lidRef.current) {
            const targetRotation = isOpen ? -2.2 : 0
            lidRef.current.rotation.x = MathUtils.lerp(lidRef.current.rotation.x, targetRotation, delta * 3)
        }

        // Animate Light Ball Rising
        if (lightBallRef.current) {
            // Target Y: Float up to 1.5 if open, stay hidden at 0 if closed
            // Base Y is relative to the group
            const targetY = isOpen ? 1.0 : -0.2
            lightBallRef.current.position.y = MathUtils.lerp(lightBallRef.current.position.y, targetY, delta * 2)

            // Also animate scale for effect
            const targetScale = isOpen ? 1 : 0.1
            const currentScale = lightBallRef.current.scale.x
            const newScale = MathUtils.lerp(currentScale, targetScale, delta * 2)
            lightBallRef.current.scale.setScalar(newScale)
        }
    })

    const boxColor = "rgba(251, 13, 13, 1)" // Luxurious deep red
    const ribbonColor = "#fffc62" // Gold

    // Wall thickness
    const t = 0.1
    const w = 1.6
    const h = 1.0
    const d = 1.6

    return (
        <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
                e.stopPropagation()
                const newState = !isOpen
                setIsOpen(newState)
                onOpen?.(newState)
            }}
            position={[0, -0.5, 0]}
        >
            {/* HOLLOW BOX CONSTRUCTION */}
            {/* Floor */}
            <mesh position={[0, -h / 2 + t / 2, 0]}>
                <boxGeometry args={[w, t, d]} />
                <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Front Wall */}
            <mesh position={[0, 0, d / 2 - t / 2]}>
                <boxGeometry args={[w, h, t]} />
                <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Back Wall */}
            <mesh position={[0, 0, -d / 2 + t / 2]}>
                <boxGeometry args={[w, h, t]} />
                <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Left Wall */}
            <mesh position={[-w / 2 + t / 2, 0, 0]}>
                <boxGeometry args={[t, h, d - 2 * t]} />
                <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Right Wall */}
            <mesh position={[w / 2 - t / 2, 0, 0]}>
                <boxGeometry args={[t, h, d - 2 * t]} />
                <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Vertical Ribbon (Static parts on walls) */}
            {/* Simplified ribbon - just slight extrusions on the walls */}
            <mesh position={[0, 0, d / 2 + 0.01]} scale={[0.2, 1, 0.05]}>
                <boxGeometry args={[1, h, 1]} />
                <meshStandardMaterial color={ribbonColor} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* THE RISING LIGHT BALL */}
            <mesh ref={lightBallRef} position={[0, -0.2, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial
                    color="#fff"
                    emissive="#ffcc88"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
                <pointLight distance={3} intensity={isOpen ? 1 : 0} color="#ffaa00" decay={2} />
            </mesh>

            {/* ROTATING LID */}
            <group position={[0, h / 2, -d / 2]} ref={lidRef}>
                {/* Lid Group offset center */}
                <group position={[0, 0, d / 2]}>
                    <mesh position={[0, t / 2, 0]}>
                        <boxGeometry args={[w + 0.1, t, d + 0.1]} />
                        <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
                    </mesh>

                    {/* Ribbons on Lid */}
                    <mesh position={[0, t / 2 + 0.01, 0]}>
                        <boxGeometry args={[w + 0.12, t, 0.3]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, t / 2 + 0.01, 0]}>
                        <boxGeometry args={[0.3, t, d + 0.12]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* Bow */}
                    <mesh position={[0, t + 0.15, 0]} rotation={[0, 0.785, 0]}>
                        <boxGeometry args={[0.5, 0.3, 0.5]} />
                        <meshStandardMaterial color={ribbonColor} metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            </group>
        </group>
    )
}

export default GiftBox
