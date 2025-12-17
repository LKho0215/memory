import { useState, useRef } from 'react'
import { OrbitControls, Stats } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'
import StarField from './StarField'
import GiftBox from './GiftBox'
import FloatingMemories from './FloatingMemories'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const CameraRig = ({ viewMode }: { viewMode: 'default' | 'gift' | 'memory' }) => {
    const { controls } = useThree() as any
    const returnTarget = useRef<{ pos: Vector3, look: Vector3 } | null>(null)

    useFrame((state, delta) => {
        const step = delta * 2

        if (viewMode !== 'default') {
            // 1. Capture current state if we haven't yet (and we came from default)
            if (!returnTarget.current && controls) {
                returnTarget.current = {
                    pos: state.camera.position.clone(),
                    look: controls.target.clone()
                }
            }

            // 2. Define Target
            const targetPos = new Vector3(0, 0, 25) // Base/Memory view
            const targetLook = new Vector3(0, 0, 0)

            if (viewMode === 'gift') {
                targetPos.set(0, 4, 8)
            }

            // 3. Lerp
            state.camera.position.lerp(targetPos, step)
            if (controls) {
                controls.target.lerp(targetLook, step)
                controls.update()
            }
        } else {
            // Return to previous view if saved
            if (returnTarget.current) {
                state.camera.position.lerp(returnTarget.current.pos, step)
                if (controls) {
                    controls.target.lerp(returnTarget.current.look, step)
                    controls.update()
                }

                // Release control once close enough
                if (state.camera.position.distanceTo(returnTarget.current.pos) < 0.5) {
                    returnTarget.current = null
                }
            }
        }
    })

    return null
}

const Experience = () => {
    const [viewMode, setViewMode] = useState<'default' | 'gift' | 'memory'>('default')

    return (
        <>
            <color attach="background" args={['#050510']} /> {/* Deep dark blue/black */}

            <CameraRig viewMode={viewMode} />

            <OrbitControls
                makeDefault
                enablePan={false}
                maxDistance={35}
                minDistance={5}
            // Disable manual control when in specific modes if desired, or just let them fight gently
            // enabled={viewMode === 'default'} 
            />
            <Stats />

            {/* Cinematic Lighting - Brightened */}
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffaaee" />
            <pointLight position={[-10, 5, -10]} intensity={1.0} color="#aaeeff" /> {/* Added fill light */}

            <StarField />

            <GiftBox onOpen={(isOpen) => setViewMode(isOpen ? 'gift' : 'default')} />
            <FloatingMemories onFocus={(isFocused) => setViewMode(isFocused ? 'memory' : 'default')} />

            {/* Post Processing for Glow - Optimized */}
            <EffectComposer multisampling={0}>
                <Bloom
                    luminanceThreshold={0.6}
                    intensity={0.8}
                    radius={0.3}
                />
            </EffectComposer>
        </>
    )
}

export default Experience
