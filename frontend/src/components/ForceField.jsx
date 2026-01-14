import React, { useEffect, useRef } from 'react';

const ForceField = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const DOT_SPACING = 30; // Space between dots
        const DOT_RADIUS = 1.5;
        const MOUSE_RADIUS = 150; // Radius of effect
        const FORCE_FACTOR = 0.5; // Repulsion strength
        const RETURN_STRENGTH = 0.05; // How fast they snap back
        const DAMPING = 0.9; // Friction

        let dots = [];

        const initDots = () => {
            dots = [];
            const cols = Math.ceil(canvas.width / DOT_SPACING);
            const rows = Math.ceil(canvas.height / DOT_SPACING);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * DOT_SPACING + DOT_SPACING / 2;
                    const y = j * DOT_SPACING + DOT_SPACING / 2;
                    dots.push({
                        x: x, // Current position
                        y: y,
                        originX: x, // Home position
                        originY: y,
                        vx: 0, // Velocity
                        vy: 0
                    });
                }
            }
        };

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                initDots();
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#cbd5e1'; // Light steel blue/gray (Tailwind gray-300ish)

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];

                // 1. Calculate distance to mouse
                const dx = mouseRef.current.x - dot.x;
                const dy = mouseRef.current.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 2. Repulsion Force (Push away if close)
                if (distance < MOUSE_RADIUS) {
                    const angle = Math.atan2(dy, dx);
                    // The closer, the stronger the push
                    const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
                    const repulsion = force * FORCE_FACTOR * 2; // Multiplier for "snap"

                    dot.vx -= Math.cos(angle) * repulsion;
                    dot.vy -= Math.sin(angle) * repulsion;
                }

                // 3. Spring Force (Pull back to origin)
                const homeDx = dot.originX - dot.x;
                const homeDy = dot.originY - dot.y;

                dot.vx += homeDx * RETURN_STRENGTH;
                dot.vy += homeDy * RETURN_STRENGTH;

                // 4. Physics Update
                dot.vx *= DAMPING;
                dot.vy *= DAMPING;
                dot.x += dot.vx;
                dot.y += dot.vy;

                // 5. Draw
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-auto"
            style={{ zIndex: 0 }}
        />
    );
};

export default ForceField;
