import React, { useState } from 'react';
import { ArrowUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = ({ onStartWithPrompt, onStartWithFile }) => {
    const [prompt, setPrompt] = useState('');
    const fileInputRef = React.useRef(null);

    return (
        <div
            className="min-h-screen w-full font-sans text-gray-900 flex flex-col items-center overflow-x-hidden selection:bg-pink-100 selection:text-pink-900 relative"
            style={{
                background: `
                    radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                    radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                    #ffffff
                `
            }}
        >


            <main
                className="flex-1 w-full max-w-6xl px-6 flex flex-col items-center text-center mt-36 md:mt-48 relative z-10"
            >

                {/* Hero Layout */}
                <div className="relative mb-4 w-full flex flex-col items-center">

                    {/* The Elephant Peeking Over - Absolute Positioned relative to the text block */}
                    <div className="relative w-full max-w-3xl">
                        {/* Elephant Image - Positioned to look like it's sitting on the text */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute -top-14 right-[5vw] md:-top-20 md:right-[calc(5rem+5vw)] z-20 pointer-events-none"
                        >
                            <img
                                src="/elephant_transparent.png"
                                alt="Elephant"
                                className="w-28 md:w-44 drop-shadow-xl transform"
                            />
                        </motion.div>

                        <h1 className="font-display text-[4.5rem] leading-[0.85] md:text-[7.2rem] lg:text-[9rem] text-black tracking-tighter select-none flex flex-col items-center z-10 relative">
                            <span className="relative z-10">AI DRAWING</span>
                            <span className="relative z-10">BOOK</span>
                        </h1>
                    </div>
                </div>

                {/* Subtext */}
                <div className="max-w-4xl mb-6 mt-2 flex flex-col items-center gap-1">
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                        Every great doodle starts with an idea!
                    </p>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                        Type in anything you can imagine, and our AI turns it into a clean outline ready to colour.
                    </p>
                </div>

                {/* Search / Input Area */}
                <div className="w-full max-w-2xl group relative z-30 mb-6">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                    <div className="relative z-10 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50/50 flex items-center p-2 group-focus-within:shadow-[0_8px_30px_rgb(59,130,246,0.1)] transition-all duration-300">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    onStartWithFile(e.target.files[0]);
                                }
                            }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                            title="Upload an image"
                        >
                            <Plus size={22} strokeWidth={2.5} />
                        </button>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && prompt.trim()) {
                                    onStartWithPrompt(prompt);
                                }
                            }}
                            placeholder="Describe your doodle... (e.g., A dragon eating pizza)"
                            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-2 text-lg font-medium"
                        />
                        <div className="flex items-center gap-1 pr-1">

                            <button
                                onClick={() => {
                                    if (prompt.trim()) {
                                        onStartWithPrompt(prompt);
                                    }
                                }}
                                className="p-3 bg-[#1a1a1a] text-white rounded-full hover:bg-black hover:scale-110 active:scale-95 transition-all shadow-md"
                            >
                                <ArrowUp size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl px-4 mt-2 animate-fade-in-up">
                    <SuggestionCard
                        icon="🐶"
                        text="A puppy's birthday party"
                        onClick={() => onStartWithPrompt("A puppy's birthday party")}
                    />
                    <SuggestionCard
                        icon="🦄"
                        text="A unicorn ice skating on a rainbow"
                        onClick={() => onStartWithPrompt("A unicorn ice skating on a rainbow")}
                    />
                    <SuggestionCard
                        icon="🏰"
                        text="A castle made entirely of candy"
                        onClick={() => onStartWithPrompt("A castle made entirely of candy")}
                    />
                </div>
            </main>

        </div>
    );
};


const SuggestionCard = ({ icon, text, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white p-5 rounded-2xl text-left shadow-sm border border-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-row items-center gap-3 h-full"
    >
        <div className="text-xl flex-shrink-0">
            {icon}
        </div>
        <span className="font-medium text-sm text-gray-800 group-hover:text-black leading-snug">
            {text}
        </span>
    </button>
);

export default LandingPage;


