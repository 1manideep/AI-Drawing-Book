import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const AvatarSelection = ({ isOpen, onClose, selectedAvatar, onSelect }) => {
    if (!isOpen) return null;

    const avatars = [
        { id: 'dog', label: 'Dog' },
        { id: 'dinosaur', label: 'Dinosaur' },
        { id: 'robot', label: 'Robot' },
        { id: 'cat', label: 'Cat' }
    ];

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300"
            style={{
                background: `
                    radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                    radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                    #ffffff
                `
            }}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors"
            >
                <X size={32} />
            </button>

            <div className="text-center max-w-4xl w-full">
                <h2 className="text-5xl md:text-7xl font-display font-black tracking-tight text-gray-900 mb-6 drop-shadow-sm">
                    Choose Your Character
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-2xl mx-auto font-medium">
                    Pick an avatar that represents your creative spirit!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 justify-items-center">
                    {avatars.map((avatar) => {
                        const imgSrc = `/pfps/${['dinosaur', 'cat'].includes(avatar.id) ? `${avatar.id}_v2` : avatar.id}.png`;
                        return (
                            <motion.button
                                key={avatar.id}
                                initial={selectedAvatar === avatar.id ? { y: 20, opacity: 0 } : { opacity: 0 }}
                                animate={selectedAvatar === avatar.id ? { y: 0, opacity: 1, scale: 1.1 } : { opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                onClick={() => {
                                    onSelect(avatar.id);
                                    setTimeout(onClose, 300); // Close after brief delay for visual feedback
                                }}
                                className="group relative flex flex-col items-center gap-6 focus:outline-none"
                            >
                                <div className={`relative w-40 h-40 md:w-56 md:h-56 transition-all duration-300 ${selectedAvatar === avatar.id ? 'drop-shadow-2xl' : 'hover:scale-105 drop-shadow-sm'}`}>
                                    <img
                                        src={imgSrc}
                                        alt={avatar.label}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <span className={`text-2xl md:text-3xl font-bold ${selectedAvatar === avatar.id ? 'text-indigo-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {avatar.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AvatarSelection;
