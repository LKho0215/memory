import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, DoubleSide, PlaneGeometry } from 'three'

const SakuraPetals = ({ count = 60 }) => {
    const meshRef = useRef<InstancedMesh>(null)
    const dummy = useMemo(() => new Object3D(), [])

    // Petal geometry - simple elongated plane
    const petalGeometry = useMemo(() => {
        const geo = new PlaneGeometry(0.3, 0.15, 1, 1)
        // Slight curve would be nice but keeping it simple
        return geo
    }, [])

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const speed = 0.005 + Math.random() * 0.01
            const x = (Math.random() - 0.5) * 40
            const y = 25 + Math.random() * 10 // Start from top
            const z = (Math.random() - 0.5) * 30
            const rotSpeed = (Math.random() - 0.5) * 0.1
            const swaySpeed = 0.5 + Math.random() * 1.5
            const swayAmount = 0.5 + Math.random() * 1

            temp.push({ t, speed, x, y, z, rotSpeed, swaySpeed, swayAmount, initialX: x })
        }
        return temp
    }, [count])

    useFrame((state) => {
        if (!meshRef.current) return

        particles.forEach((particle, i) => {
            particle.t += particle.speed

            // Gentle falling
            particle.y -= 0.03
            if (particle.y < -15) {
                particle.y = 25
                particle.x = particle.initialX
            }

            // Swaying motion
            const sway = Math.sin(state.clock.elapsedTime * particle.swaySpeed + particle.t) * particle.swayAmount

            dummy.position.set(
                particle.x + sway,
                particle.y,
                particle.z + sway * 0.5
            )

            // Tumbling rotation
            dummy.rotation.x = state.clock.elapsedTime * particle.rotSpeed + particle.t
            dummy.rotation.y = state.clock.elapsedTime * particle.rotSpeed * 1.5
            dummy.rotation.z = Math.sin(state.clock.elapsedTime + particle.t) * 0.5

            dummy.scale.setScalar(0.8 + Math.sin(particle.t) * 0.2)
            dummy.updateMatrix()

            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[petalGeometry, undefined, count]}>
            <meshStandardMaterial
                color="#ffb7c5"
                emissive="#ff8fab"
                emissiveIntensity={0.3}
                side={DoubleSide}
                transparent
                opacity={0.9}
            />
        </instancedMesh>
    )
}

export default SakuraPetals
