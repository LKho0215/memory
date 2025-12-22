import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, AdditiveBlending, ShaderMaterial } from 'three'

const StarField = ({ count = 1000 }) => {
    const points = useRef<Points>(null)

    const { positions, colorIds } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colorIds = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            const r = 40 + Math.random() * 30
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            // Random color ID for variety
            colorIds[i] = Math.floor(Math.random() * 4)
        }
        return { positions, colorIds }
    }, [count])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
    }), [])

    useFrame((state) => {
        const { clock } = state
        if (points.current) {
            points.current.rotation.y = clock.getElapsedTime() * 0.02
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
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aColorId"
                    count={colorIds.length}
                    array={colorIds}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                blending={AdditiveBlending}
                depthWrite={false}
                fragmentShader={`
                    uniform float uTime;
                    varying float vColorId;
                    
                    void main() {
                        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                        float r = dot(cxy, cxy);
                        if (r > 1.0) discard;
                        float glow = 1.0 - r;
                        glow = pow(glow, 2.0);
                        
                        // Pastel color palette
                        vec3 pink = vec3(1.0, 0.7, 0.85);
                        vec3 lavender = vec3(0.8, 0.7, 1.0);
                        vec3 mint = vec3(0.7, 1.0, 0.9);
                        vec3 peach = vec3(1.0, 0.85, 0.75);
                        
                        vec3 color;
                        float id = floor(vColorId + 0.5);
                        if (id < 1.0) color = pink;
                        else if (id < 2.0) color = lavender;
                        else if (id < 3.0) color = mint;
                        else color = peach;
                        
                        float twinkle = sin(uTime * 2.0 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1) * 0.5 + 0.5;
                        
                        gl_FragColor = vec4(color, glow * twinkle * 0.7);
                    }
                `}
                vertexShader={`
                    uniform float uTime;
                    attribute float aColorId;
                    varying float vColorId;
                    
                    void main() {
                        vColorId = aColorId;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = (180.0 / -mvPosition.z) * (1.0 + sin(uTime + position.x) * 0.2);
                    }
                `}
                transparent
                uniforms={uniforms}
            />
        </points>
    )
}

export default StarField

