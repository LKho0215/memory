import { useState, useRef } from 'react'
import { OrbitControls, Stats } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'
import StarField from './StarField'
import GiftBox from './GiftBox'
import FloatingMemories from './FloatingMemories'
import HeartParticles from './HeartParticles'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const CameraRig = ({ viewMode, started }: { viewMode: 'default' | 'gift' | 'memory', started: boolean }) => {
    const { controls } = useThree() as any
    const returnTarget = useRef<{ pos: Vector3, look: Vector3 } | null>(null)
    const flyInDone = useRef(false)

    useFrame((state, delta) => {
        // Slow down the fly-in slightly for grandeur
        const step = delta * 1.5

        // ENTRY ANIMATION
        if (!started) {
            // Keep camera far away waiting
            const waitingPos = new Vector3(0, 5, 50)
            state.camera.position.lerp(waitingPos, step)
            // Slowly rotate around center while waiting
            state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 5
            return
        }

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
            // Default View - but consider "Entry" transition
            // If we just started, we are flying in from Z=50 to Z=15
            const defaultPos = new Vector3(0, 0, 15)

            // Return to previous view if saved (from gift/memory mode)
            if (returnTarget.current) {
                state.camera.position.lerp(returnTarget.current.pos, step)
                if (controls) {
                    controls.target.lerp(returnTarget.current.look, step)
                    controls.update()
                }

                if (state.camera.position.distanceTo(returnTarget.current.pos) < 0.5) {
                    returnTarget.current = null
                }
            }
            // Only force fly-in if NOT done yet
            else if (!flyInDone.current) {
                // Normal operation / Fly-in completion
                // This lerp handles the fly-in from Z=50 seamlessly because default target is Z=15
                state.camera.position.lerp(defaultPos, step) // Smooth fly in

                // Unlock controls once close enough
                if (state.camera.position.distanceTo(defaultPos) < 1.0) {
                    flyInDone.current = true
                }
            }
        }
    })

    return null
}

const Experience = ({ started }: { started: boolean }) => {
    const [viewMode, setViewMode] = useState<'default' | 'gift' | 'memory'>('default')

    return (
        <>
            {/* Romantic Deep Background */}
            <color attach="background" args={['#180510']} />

            <CameraRig viewMode={viewMode} started={started} />

            <OrbitControls
                makeDefault
                enablePan={false}
                maxDistance={35}
                minDistance={5}
            // Disable manual control when in specific modes if desired, or just let them fight gently
            // enabled={viewMode === 'default'} 
            />
            <Stats />

            {/* Romantic Lighting - Warmer & Softer */}
            <ambientLight intensity={0.8} color="#ffaadd" />
            <pointLight position={[10, 10, 10]} intensity={2.0} color="#ff88aa" />
            <pointLight position={[-10, 5, -10]} intensity={1.5} color="#d4aaff" />
            <pointLight position={[0, -10, 5]} intensity={0.5} color="#ffaa00" /> {/* Underlighting */}

            <StarField count={800} />
            <HeartParticles count={40} />

            <GiftBox onOpen={(isOpen) => setViewMode(isOpen ? 'gift' : 'default')} />
            <FloatingMemories onFocus={(isFocused) => setViewMode(isFocused ? 'memory' : 'default')} />

            {/* Post Processing for Glow */}
            <EffectComposer multisampling={0}>
                <Bloom
                    luminanceThreshold={0.5}
                    intensity={1.0}
                    radius={0.4}
                />
            </EffectComposer>
        </>
    )
}

export default Experience
