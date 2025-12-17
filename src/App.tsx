import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './components/Experience'

const BACKGROUND_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-11005.mp3" // Royalty free sample

const BGMPlayer = ({ started }: { started: boolean }) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(0.4)

    useEffect(() => {
        if (started && audioRef.current) {
            audioRef.current.volume = volume
            audioRef.current.play().catch(e => console.log("Audio play failed:", e))
        }
    }, [started])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = muted
        }
    }, [muted])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    if (!started) return null

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
            color: 'white',
            fontFamily: "'Playfair Display', serif",
            cursor: 'default', // Changed to default so clicking slider doesn't trigger parent click
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(0,0,0,0.5)',
            padding: '10px 20px',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(5px)'
        }}>
            <div
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={() => setMuted(!muted)}
            >
                <span style={{ fontSize: '1.2rem' }}>{muted || volume === 0 ? "🔇" : "🎵"}</span>
            </div>

            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    setVolume(val)
                    if (val > 0 && muted) setMuted(false)
                }}
                style={{
                    width: '100px',
                    accentColor: '#ff88aa',
                    cursor: 'pointer',
                    height: '4px',
                    borderRadius: '2px'
                }}
            />
            <audio ref={audioRef} loop src={BACKGROUND_MUSIC_URL} />
        </div>
    )
}

function App() {
    const [started, setStarted] = useState(false)

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
                <Experience started={started} />
            </Canvas>

            <BGMPlayer started={started} />

            {!started && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: '#000',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    color: '#ffccdd',
                    transition: 'opacity 1s ease-out'
                }} onClick={() => setStarted(true)}>
                    <h1 style={{
                        fontFamily: "'Great Vibes', cursive",
                        fontSize: '5rem',
                        margin: 0,
                        textShadow: '0 0 20px rgba(255, 100, 150, 0.6)'
                    }}>
                        For Jolleen
                    </h1>
                    <p style={{
                        fontFamily: "'Playfair Display', serif",
                        marginTop: '1rem',
                        fontSize: '1.2rem',
                        color: '#888',
                        cursor: 'pointer'
                    }}>
                        Tap to Open
                    </p>
                </div>
            )}
        </div>
    )
}

export default App
