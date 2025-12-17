import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, Color, AdditiveBlending, ShaderMaterial } from 'three'

const StarField = ({ count = 1000 }) => {
    const points = useRef<Points>(null)

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            // Spherical distribution
            const r = 40 + Math.random() * 30 // Distance from center
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z
        }
        return positions
    }, [count])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new Color('#ffddaa') }, // Goldish tint for luxury
    }), [])

    useFrame((state) => {
        const { clock } = state
        if (points.current) {
            // Slow rotation
            points.current.rotation.y = clock.getElapsedTime() * 0.02
            // Uniform update
            if (points.current.material instanceof ShaderMaterial) {
                points.current.material.uniforms.uTime.value = clock.getElapsedTime()
            }
        }
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesPosition.length / 3}
                    array={particlesPosition}
                    itemSize={3}
                />
            </bufferGeometry>
            {/* Custom shader for soft glowing dots */}
            <shaderMaterial
                blending={AdditiveBlending}
                depthWrite={false}
                fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          void main() {
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            if (r > 1.0) discard;
            float glow = 1.0 - r; // Soft edge
            glow = pow(glow, 2.0); // Sharpen center
            
            // Twinkle
            float twinkle = sin(uTime * 2.0 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1) * 0.5 + 0.5;
            
            gl_FragColor = vec4(uColor, glow * twinkle * 0.8);
          }
        `}
                vertexShader={`
          uniform float uTime;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            // Size attenuation
            gl_PointSize = (200.0 / -mvPosition.z) * (1.0 + sin(uTime + position.x) * 0.2); 
          }
        `}
                transparent
                uniforms={uniforms}
            />
        </points>
    )
}

export default StarField
