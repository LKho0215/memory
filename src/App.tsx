import { Canvas } from '@react-three/fiber'
import Experience from './components/Experience'

function App() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
            <Canvas
                dpr={[1, 1]} // Force 1x resolution for performance checking
                gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 200,
                    position: [0, 0, 15]
                }}
            >
                <Experience />
            </Canvas>
        </div>
    )
}

export default App
