import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, AdditiveBlending, ShaderMaterial } from 'three'

const Sparkles = ({ count = 100 }) => {
    const points = useRef<Points>(null)

    const { positions, sizes, phases } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const phases = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            // Distribute in a sphere
            const r = 15 + Math.random() * 20
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            sizes[i] = 0.5 + Math.random() * 1.5
            phases[i] = Math.random() * Math.PI * 2
        }
        return { positions, sizes, phases }
    }, [count])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
    }), [])

    useFrame((state) => {
        if (points.current?.material instanceof ShaderMaterial) {
            points.current.material.uniforms.uTime.value = state.clock.elapsedTime
        }
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={sizes.length}
                    array={sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aPhase"
                    count={phases.length}
                    array={phases}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                blending={AdditiveBlending}
                depthWrite={false}
                transparent
                uniforms={uniforms}
                vertexShader={`
                    attribute float aSize;
                    attribute float aPhase;
                    uniform float uTime;
                    varying float vAlpha;
                    
                    void main() {
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        
                        // Twinkle effect
                        float twinkle = sin(uTime * 3.0 + aPhase) * 0.5 + 0.5;
                        vAlpha = twinkle * twinkle; // Sharper twinkle
                        
                        gl_PointSize = aSize * (200.0 / -mvPosition.z) * twinkle;
                    }
                `}
                fragmentShader={`
                    varying float vAlpha;
                    
                    void main() {
                        vec2 center = gl_PointCoord - 0.5;
                        float dist = length(center);
                        if (dist > 0.5) discard;
                        
                        // Soft glow
                        float glow = 1.0 - dist * 2.0;
                        glow = pow(glow, 2.0);
                        
                        // Pink/white sparkle color
                        vec3 color = mix(vec3(1.0, 0.8, 0.9), vec3(1.0), glow);
                        
                        gl_FragColor = vec4(color, glow * vAlpha * 0.8);
                    }
                `}
            />
        </points>
    )
}

export default Sparkles
