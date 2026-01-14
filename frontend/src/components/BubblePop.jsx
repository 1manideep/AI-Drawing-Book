import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Singleton AudioContext to prevent "suspended" state issues
let sharedAudioCtx = null;

const getAudioContext = () => {
    if (!sharedAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            sharedAudioCtx = new AudioContext();
        }
    }
    return sharedAudioCtx;
};

// Improved "Wet" Bubble Pop Sound
const playPopSound = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Ensure context is running (unlock audio on user interaction)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(e => console.error("Audio resume failed", e));
        }

        const t = ctx.currentTime;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        // A "bloop" sound: Frequency rises quickly then stops
        oscillator.frequency.setValueAtTime(400, t);
        oscillator.frequency.exponentialRampToValueAtTime(800, t + 0.1);

        // Envelope: Fast attack, fast decay
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.5, t + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(t);
        oscillator.stop(t + 0.15);
    } catch (e) {
        console.error("Pop sound failed", e);
    }
};

const Bubble = ({ id, x, y, size, color, delay, onPop }) => {
    // Randomize duration slightly for variety
    const duration = 6 + Math.random() * 4;

    const handleInteraction = () => {
        playPopSound();
        onPop(id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, y: y + 20, x: x }}
            animate={{
                opacity: [0, 0.9, 0.9, 0],
                scale: [0.6, 1, 1, 1.1],
                y: [y, -150], // Move straight up well past screen top
                x: [x, x + (Math.random() > 0.5 ? 20 : -20), x] // Gentle sway
            }}
            exit={{
                scale: 1.5,
                opacity: 0,
                filter: "blur(4px)",
                transition: { duration: 0.15 }
            }}
            transition={{
                duration: duration,
                ease: "linear", // Smooth continuous movement
                times: [0, 0.1, 0.9, 1], // Fade in/out timing
                x: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut" // Smooth sine-wave like strafing
                }
            }}
            onMouseEnter={handleInteraction}
            onPointerDown={handleInteraction} // Handle touch/click specifically
            className="absolute rounded-full cursor-grab touch-manipulation pointer-events-auto"
            style={{
                width: size,
                height: size,
                // Realistic Bubble Gradient
                background: `radial-gradient(circle at 30% 30%, 
                    rgba(255, 255, 255, 0.9) 0%, 
                    rgba(255, 255, 255, 0.4) 15%, 
                    ${color} 40%, 
                    rgba(255, 255, 255, 0.1) 60%, 
                    rgba(255, 255, 255, 0.4) 100%
                )`,
                boxShadow: `
                    inset 0 0 10px rgba(255, 255, 255, 0.8), 
                    inset 2px 2px 5px ${color},
                    0 4px 10px rgba(0, 0, 0, 0.05)
                `,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(1px)',
            }}
        >
            {/* Highlights */}
            <div className="absolute top-[18%] left-[22%] w-[20%] h-[12%] rounded-[50%] bg-white opacity-80 rotate-[-45deg] blur-[0.5px]"></div>
        </motion.div>
    );
};

export default function BubblePop() {
    const [bubbles, setBubbles] = useState([]);

    // Softer pastel palette
    const colors = [
        'rgba(255, 192, 203, 0.3)', // Pink
        'rgba(135, 206, 235, 0.3)', // Sky Blue
        'rgba(221, 160, 221, 0.3)', // Plum
        'rgba(255, 250, 205, 0.4)', // Lemon
        'rgba(152, 251, 152, 0.3)'  // Pale Green
    ];

    useEffect(() => {
        let isMounted = true;

        const spawnBubble = (initialY = null) => {
            if (!isMounted) return;

            const newBubble = {
                id: Date.now() + Math.random(),
                x: Math.random() * window.innerWidth,
                y: initialY !== null ? initialY : window.innerHeight + 50,
                size: 40 + Math.random() * 60,
                color: colors[Math.floor(Math.random() * colors.length)],
            };

            setBubbles(prev => {
                // Remove old bubbles to prevent memory leaks (simple limit)
                const kept = prev.length > 35 ? prev.slice(5) : prev;
                return [...kept, newBubble];
            });
        };

        // Initial population
        for (let i = 0; i < 15; i++) {
            spawnBubble(Math.random() * window.innerHeight);
        }

        // Continuous Spawning
        const interval = setInterval(() => {
            spawnBubble();
        }, 400); // 2.5 bubbles per second

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const handlePop = (id) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <AnimatePresence mode='popLayout'>
                {bubbles.map(bubble => (
                    <Bubble
                        key={bubble.id}
                        {...bubble}
                        onPop={handlePop}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
