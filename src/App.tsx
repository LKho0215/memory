import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './components/Experience'

// const BACKGROUND_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-11005.mp3"
const BACKGROUND_MUSIC_URL = "bgm.mp3"
// Sound effects helper - plays cute sounds
const playSound = (type: 'click' | 'sparkle' | 'open') => {
    // Using Web Audio API for simple tones
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        if (type === 'click') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.1)
        } else if (type === 'sparkle') {
            oscillator.frequency.setValueAtTime(1500, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.2)
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.2)
        } else if (type === 'open') {
            // Chime-like sound
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // E5
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // G5
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.4)
        }
    } catch (e) {
        console.log('Sound effect failed:', e)
    }
}

    // Expose playSound globally for child components
    ; (window as any).playCuteSound = playSound

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
            cursor: 'default',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(255, 200, 220, 0.2)',
            padding: '12px 24px',
            borderRadius: '30px',
            border: '2px solid rgba(255, 180, 200, 0.4)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(255, 100, 150, 0.2)'
        }}>
            <div
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                    playSound('click')
                    setMuted(!muted)
                }}
            >
                <span style={{ fontSize: '1.3rem' }}>{muted || volume === 0 ? "🔇" : "🎵"}</span>
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
                    accentColor: '#ffaacc',
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

    const handleStart = () => {
        playSound('open')
        setStarted(true)
    }

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0008' }}>
            <Canvas
                dpr={[1, 1]}
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
                    background: 'radial-gradient(ellipse at center, #1a0815 0%, #0a0008 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    color: '#ffddee',
                    transition: 'opacity 1s ease-out',
                    cursor: 'pointer'
                }} onClick={handleStart}>
                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-10px); }
                        }
                        @keyframes sparkle {
                            0%, 100% { opacity: 0.3; transform: scale(1); }
                            50% { opacity: 1; transform: scale(1.2); }
                        }
                        @keyframes pulse {
                            0%, 100% { text-shadow: 0 0 20px rgba(255, 100, 150, 0.6); }
                            50% { text-shadow: 0 0 40px rgba(255, 100, 150, 0.9), 0 0 60px rgba(255, 150, 200, 0.5); }
                        }
                    `}</style>

                    <div style={{ animation: 'sparkle 2s ease-in-out infinite', fontSize: '2rem', marginBottom: '1rem' }}>
                        ✨💕✨
                    </div>

                    <h1 style={{
                        fontFamily: "'Great Vibes', cursive",
                        fontSize: '5rem',
                        margin: 0,
                        animation: 'pulse 3s ease-in-out infinite, float 4s ease-in-out infinite',
                        textShadow: '0 0 30px rgba(255, 100, 150, 0.7)'
                    }}>
                        For Jolleen
                    </h1>

                    <p style={{
                        fontFamily: "'Playfair Display', serif",
                        marginTop: '1.5rem',
                        fontSize: '1.2rem',
                        color: '#ccaabb',
                        cursor: 'pointer',
                        animation: 'float 3s ease-in-out infinite 0.5s'
                    }}>
                        🌸 Tap to Open 🌸
                    </p>
                </div>
            )}
        </div>
    )
}

export default App

