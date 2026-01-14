import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div
            className="min-h-screen w-full font-sans text-gray-900 pt-32 pb-20 px-6"
            style={{
                background: `
                    radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                    radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                    #ffffff
                `
            }}
        >
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/80 backdrop-blur-md rounded-[2rem] px-8 py-10 md:px-20 md:py-16 shadow-sm border border-white/60"
                >
                    <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-8 text-center text-gray-900">
                        From Pixels to Paper: <br />
                        <span className="text-indigo-600">The Story of AI Drawing Book</span>
                    </h1>

                    <div className="space-y-6 text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                        <p>
                            Growing up, a fresh coloring book was my ultimate escape. There was something truly magical about a blank page and a brand new box of crayons it was a world where anything was possible, and the only limit was my own imagination.
                        </p>

                        <p>
                            With Christmas approaching, I found myself thinking about the perfect gift for my cousin’s kids. I wanted to give them something more meaningful than a store bought toy; I wanted to give them that same spark of childhood magic I felt years ago.
                        </p>

                        <p>
                            Leveraging my background in AI engineering, I decided to build a bridge between cutting-edge technology and hands-on creativity. The result is the <a href="https://aidrawingbook.manideep.info" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-800 underline decoration-2 decoration-indigo-300 hover:decoration-indigo-600 transition-all">AI Drawing Book</a>.
                        </p>

                        <p>
                            I built this to turn my little nephew's wildest imaginations into something he could actually hold and color. I hope it sparks as much joy for you as it did for me.
                        </p>

                        <div className="mt-8 text-right font-serif text-xl text-gray-800">
                            Happy coloring, <br />
                            <a
                                href="https://manideep.info"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="italic text-indigo-600 hover:text-indigo-800 transition-colors border-b border-indigo-300 hover:border-indigo-600"
                            >
                                Manideep
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
