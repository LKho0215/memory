import { useState, useEffect, useRef } from 'react'

interface RPGDialogProps {
    show: boolean
    onComplete?: () => void
}

const CONVERSATIONS = [
    {
        character: "normal.png",
        name: "🐷",
        text: "Hi, this is your virtual BB💕. Hope you like the little surprise I prepared for you!"
    },
    {
        character: "smile.png",
        name: "🐷",
        text: "Ehh, you really wait for gift from me? No gift here go claim from you real BB lah😜 AIYOOO"
    }
]

const RPGDialog = ({ show, onComplete }: RPGDialogProps) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [visible, setVisible] = useState(false)

    // Audio ref for speak sound
    const speakAudioRef = useRef<HTMLAudioElement | null>(null)

    const currentConvo = CONVERSATIONS[currentIndex]

    // Initialize audio
    useEffect(() => {
        speakAudioRef.current = new Audio('speak.mp3')
        speakAudioRef.current.loop = true
        speakAudioRef.current.volume = 0.5

        return () => {
            if (speakAudioRef.current) {
                speakAudioRef.current.pause()
                speakAudioRef.current = null
            }
        }
    }, [])

    // Fade in animation
    useEffect(() => {
        if (show) {
            setVisible(true)
            setCurrentIndex(0)
            setDisplayedText('')
        }
    }, [show])

    // Typewriter effect with sound
    useEffect(() => {
        if (!visible || !currentConvo) return

        setIsTyping(true)
        setDisplayedText('')
        let i = 0
        const text = currentConvo.text

        // Start speak sound
        if (speakAudioRef.current) {
            speakAudioRef.current.currentTime = 0
            speakAudioRef.current.play().catch(e => console.log('Speak sound failed:', e))
        }

        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1))
                i++
            } else {
                setIsTyping(false)
                // Stop speak sound when done
                if (speakAudioRef.current) {
                    speakAudioRef.current.pause()
                }
                clearInterval(interval)
            }
        }, 40)

        return () => {
            clearInterval(interval)
            // Also stop sound on cleanup
            if (speakAudioRef.current) {
                speakAudioRef.current.pause()
            }
        }
    }, [currentIndex, visible])

    const handleTap = () => {
        if (isTyping) {
            // Skip to full text
            setDisplayedText(currentConvo.text)
            setIsTyping(false)
        } else if (currentIndex < CONVERSATIONS.length - 1) {
            // Next conversation
            setCurrentIndex(currentIndex + 1)
        } else {
            // Complete dialog
            setVisible(false)
            onComplete?.()
        }
    }

    if (!visible) return null

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '200px',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '20px',
                zIndex: 3000,
                cursor: 'pointer',
                animation: 'fadeIn 0.5s ease-out'
            }}
            onClick={handleTap}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>

            {/* Character Portrait - Left Side */}
            <div style={{
                width: '300px',
                height: '300px',
                marginRight: '-30px',
                zIndex: 3001,
                display: 'flex',
                alignItems: 'flex-end'
            }}>
                <img
                    src={currentConvo.character}
                    alt="Character"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                    }}
                />
            </div>

            {/* Dialog Box - Right Side */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.95) 0%, rgba(255, 220, 230, 0.95) 100%)',
                border: '4px solid #ff99bb',
                borderRadius: '20px',
                padding: '20px 25px',
                boxShadow: '0 8px 32px rgba(255, 100, 150, 0.3), inset 0 2px 0 rgba(255,255,255,0.5)',
                position: 'relative',
                minHeight: '120px'
            }}>
                {/* Character Name */}
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '20px',
                    background: 'linear-gradient(135deg, #ff88aa, #ff99bb)',
                    padding: '5px 20px',
                    borderRadius: '15px',
                    color: 'white',
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 3px 10px rgba(255, 100, 150, 0.4)'
                }}>
                    {currentConvo.name}
                </div>

                {/* Dialog Text */}
                <div style={{
                    marginTop: '10px',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    color: '#553344'
                }}>
                    {displayedText}
                    {isTyping && <span style={{ animation: 'bounce 0.5s infinite' }}>▌</span>}
                </div>

                {/* Continue indicator */}
                {!isTyping && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '15px',
                        fontSize: '0.8rem',
                        color: '#aa7788',
                        animation: 'bounce 1s infinite'
                    }}>
                        ▼ Tap to continue
                    </div>
                )}

                {/* Decorative corners */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '1rem'
                }}>💕</div>
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '1rem'
                }}>✨</div>
            </div>
        </div>
    )
}

export default RPGDialog
