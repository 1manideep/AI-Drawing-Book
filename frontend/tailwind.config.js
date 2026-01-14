/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Anton', 'sans-serif'],
            },
            colors: {
                'landing-bg-start': '#ffeaf3',
                'landing-bg-end': '#e8f4ff',
            },
            backgroundImage: {
                // 4-corner soft glow
                // Vibrant Pastel: Strong Pink Left, Strong Blue Right
                'landing-gradient': 'radial-gradient(circle at 10% 55%, #ffb3de 0%, rgba(255, 255, 255, 0) 60%), radial-gradient(circle at 90% 25%, #b3d1ff 0%, rgba(255, 255, 255, 0) 60%), #ffffff',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                jelly: {
                    '0%, 100%': { transform: 'scale(1, 1)' },
                    '25%': { transform: 'scale(0.95, 1.05)' },
                    '50%': { transform: 'scale(1.05, 0.95)' },
                    '75%': { transform: 'scale(0.98, 1.02)' },
                }
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                wiggle: 'wiggle 2s ease-in-out infinite',
                jelly: 'jelly 1s ease-in-out infinite',
                'happy-dance': 'float 3s ease-in-out infinite, wiggle 4s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}
