import { useState, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, MathUtils, BackSide } from 'three'
import StarField from './StarField'
import GiftBox from './GiftBox'
import FloatingMemories from './FloatingMemories'
import Sparkles from './Sparkles'
import SakuraPetals from './SakuraPetals'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const CameraRig = ({ viewMode, started }: { viewMode: 'default' | 'gift' | 'memory', started: boolean }) => {
    const { controls } = useThree() as any
    const returnTarget = useRef<{ pos: Vector3, look: Vector3 } | null>(null)
    const flyInDone = useRef(false)

    useFrame((state, delta) => {
        const step = delta * 1.5

        if (!started) {
            const waitingPos = new Vector3(0, 5, 50)
            state.camera.position.lerp(waitingPos, step)
            state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 5
            return
        }

        if (viewMode !== 'default') {
            if (!returnTarget.current && controls) {
                returnTarget.current = {
                    pos: state.camera.position.clone(),
                    look: controls.target.clone()
                }
            }

            const targetPos = new Vector3(0, 0, 25)
            const targetLook = new Vector3(0, 0, 0)

            if (viewMode === 'gift') {
                targetPos.set(0, 4, 8)
            }

            state.camera.position.lerp(targetPos, step)
            if (controls) {
                controls.target.lerp(targetLook, step)
                controls.update()
            }
        } else {
            const defaultPos = new Vector3(0, 0, 15)

            if (returnTarget.current) {
                state.camera.position.lerp(returnTarget.current.pos, step)
                if (controls) {
                    controls.target.lerp(returnTarget.current.look, step)
                    controls.update()
                }

                if (state.camera.position.distanceTo(returnTarget.current.pos) < 0.5) {
                    returnTarget.current = null
                }
            } else if (!flyInDone.current) {
                state.camera.position.lerp(defaultPos, step)

                if (state.camera.position.distanceTo(defaultPos) < 1.0) {
                    flyInDone.current = true
                }
            }
        }
    })

    return null
}

const InteractiveLight = () => {
    const lightRef = useRef<any>(null)
    const { viewport, mouse } = useThree()

    useFrame(() => {
        if (lightRef.current) {
            const x = (mouse.x * viewport.width) / 2
            const y = (mouse.y * viewport.height) / 2
            lightRef.current.position.set(x, y, 10)
        }
    })

    return (
        <pointLight
            ref={lightRef}
            distance={15}
            decay={2}
            intensity={2}
            color="#ffeecc"
        />
    )
}

// Cute gradient background sphere
const GradientBackground = () => {
    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[80, 32, 32]} />
            <shaderMaterial
                side={BackSide}
                vertexShader={`
                    varying vec3 vWorldPosition;
                    void main() {
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    varying vec3 vWorldPosition;
                    void main() {
                        float height = normalize(vWorldPosition).y;
                        
                        // Top: deep purple, Middle: soft pink, Bottom: warm peach
                        vec3 topColor = vec3(0.1, 0.02, 0.15);      // Deep purple
                        vec3 midColor = vec3(0.4, 0.15, 0.25);      // Dusty rose
                        vec3 bottomColor = vec3(0.3, 0.15, 0.1);    // Warm brown
                        
                        vec3 color;
                        if (height > 0.0) {
                            color = mix(midColor, topColor, height);
                        } else {
                            color = mix(midColor, bottomColor, -height);
                        }
                        
                        gl_FragColor = vec4(color, 1.0);
                    }
                `}
            />
        </mesh>
    )
}

const Experience = ({ started }: { started: boolean }) => {
    const [viewMode, setViewMode] = useState<'default' | 'gift' | 'memory'>('default')

    return (
        <>
            {/* Gradient Background */}
            <GradientBackground />

            <InteractiveLight />
            <CameraRig viewMode={viewMode} started={started} />

            <OrbitControls
                makeDefault
                enablePan={false}
                maxDistance={35}
                minDistance={5}
            />

            {/* Cute Romantic Lighting */}
            <ambientLight intensity={1.0} color="#ffccee" />
            <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffaacc" />
            <pointLight position={[-10, 5, -10]} intensity={1.5} color="#ccaaff" />
            <pointLight position={[0, -10, 5]} intensity={0.8} color="#ffcc99" />

            {/* Particles */}
            <StarField count={600} />
            <Sparkles count={80} />
            <SakuraPetals count={50} />

            {/* Scene Objects */}
            <GiftBox onOpen={(isOpen) => setViewMode(isOpen ? 'gift' : 'default')} />
            <FloatingMemories onFocus={(isFocused) => setViewMode(isFocused ? 'memory' : 'default')} />

            {/* Enhanced Bloom for Cute Glow */}
            <EffectComposer multisampling={0}>
                <Bloom
                    luminanceThreshold={0.4}
                    intensity={1.2}
                    radius={0.5}
                />
            </EffectComposer>
        </>
    )
}

export default Experience

