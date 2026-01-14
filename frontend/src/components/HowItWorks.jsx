import React from 'react';
import { Lightbulb, Keyboard, Wand2, Printer } from 'lucide-react';
import { motion } from 'framer-motion';

const StepCard = ({ icon: Icon, stepNumber, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        className="flex flex-col items-center text-center p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 hover:shadow-md transition-shadow"
    >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
            <Icon size={32} strokeWidth={2} />
        </div>
        <span className="text-sm font-bold text-indigo-500 tracking-wider mb-2 uppercase">Step {stepNumber}</span>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed max-w-xs">{description}</p>
    </motion.div>
);

const HowItWorks = () => {
    return (
        <div
            className="min-h-screen w-full font-sans text-gray-900 pt-36 pb-20 px-6"
            style={{
                background: `
                    radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.7) 0%, rgba(255, 255, 255, 0) 24%),
                    radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.7) 0%, rgba(255, 255, 255, 0) 55%),
                    #ffffff
                `
            }}
        >
            <div className="max-w-6xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 flex flex-col items-center gap-4"
                >
                    <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter mb-2">
                        How It Works
                    </h1>
                    <div className="text-xl text-gray-600 max-w-2xl mx-auto flex flex-col gap-2">
                        <p>Turn your imagination into coloring pages in seconds.</p>
                        <p className="font-medium">It’s as easy as 1-2-3-4!</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <StepCard
                        icon={Lightbulb}
                        stepNumber="1"
                        title="Imagine It"
                        description="Think of anything you'd like to color from 'a robot playing soccer' to 'a cat in a space suit.'"
                        delay={0.1}
                    />
                    <StepCard
                        icon={Keyboard}
                        stepNumber="2"
                        title="Type Your Prompt"
                        description="Enter your idea into our magic AI bar on the home page."
                        delay={0.2}
                    />
                    <StepCard
                        icon={Wand2}
                        stepNumber="3"
                        title="Watch Magic Happen"
                        description="Our AI instantly transforms your words into a clean black-and-white outline."
                        delay={0.3}
                    />
                    <StepCard
                        icon={Printer}
                        stepNumber="4"
                        title="Color and Print"
                        description="You can color them as you like, save them or even print them!"
                        delay={0.4}
                    />
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
