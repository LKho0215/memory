import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, MathUtils, Shape, ExtrudeGeometry, Color, DoubleSide } from 'three'

const HeartParticles = ({ count = 50 }) => {
    const meshRef = useRef<InstancedMesh>(null)
    const dummy = useMemo(() => new Object3D(), [])

    // Create Heart Shape
    const heartGeometry = useMemo(() => {
        const x = 0, y = 0
        const shape = new Shape()
        shape.moveTo(x + 0.5, y + 0.5)
        shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y)
        shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7)
        shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9)
        shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7)
        shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y)
        shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5)

        const extrudeSettings = {
            depth: 0.2,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 0.1,
            bevelThickness: 0.1
        }

        const geometry = new ExtrudeGeometry(shape, extrudeSettings)
        geometry.center() // Center the geometry
        geometry.rotateX(Math.PI) // Flip it so point key is down
        return geometry
    }, [])

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const factor = 20 + Math.random() * 20 // Radius
            const speed = 0.01 + Math.random() / 200
            const x = (Math.random() - 0.5) * 50
            const y = (Math.random() - 0.5) * 50
            const z = (Math.random() - 0.5) * 20

            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 })
        }
        return temp
    }, [count])

    useFrame((state) => {
        if (!meshRef.current) return

        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle

            // Movement logic: Gently float up and sway
            t = particle.t += speed / 2
            const a = Math.cos(t) + Math.sin(t * 1) / 10
            const b = Math.sin(t) + Math.cos(t * 2) / 10
            const s = Math.cos(t) // scale variance

            // Update positions
            // Basic upward drift
            particle.y += 0.02
            if (particle.y > 20) particle.y = -20

            // Apply dummy transformation
            dummy.position.set(
                particle.x + Math.cos(t) * 2,
                particle.y,
                particle.z + Math.sin(t) * 2
            )
            dummy.scale.setScalar(0.2 + Math.abs(s) * 0.2)
            dummy.rotation.x = Math.sin(t * 0.5)
            dummy.rotation.y = Math.cos(t * 0.3)
            dummy.rotation.z = Math.sin(t * 0.2)

            dummy.updateMatrix()

            // @ts-ignore
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[heartGeometry, undefined, count]}>
            <meshPhongMaterial
                color="#ff6688"
                emissive="#ff0044"
                emissiveIntensity={0.5}
                shininess={100}
                side={DoubleSide}
            />
        </instancedMesh>
    )
}

export default HeartParticles
