import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';

const Header = ({ user, onOpenGallery, onSignOut, onLogin, onSignup, onHowItWorks, onAbout, onContact, onHome, showLogo = true, selectedAvatar = 'dog', onSelectAvatar }) => {


    return (
        <header className="fixed top-6 z-50 w-full max-w-7xl px-6 flex justify-center left-1/2 -translate-x-1/2">
            <div className="bg-white/80 backdrop-blur-md pl-6 pr-8 py-3 rounded-full shadow-sm border border-white/60 flex items-center justify-between w-full max-w-5xl">
                <div className="flex items-center gap-8">
                    {/* Logo / Home Button */}
                    <button
                        onClick={onHome}
                        className="flex items-center hover:opacity-80 transition-opacity"
                    >
                        <img
                            src="/elephant-main-menu.PNG"
                            alt="Home"
                            className="h-10 w-auto object-contain"
                        />
                    </button>

                    <nav className="hidden md:flex items-center gap-8">
                        {['About', 'How It Works', 'Explore', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    if (item === 'About') onAbout?.();
                                    if (item === 'How It Works') onHowItWorks?.();
                                    if (item === 'Contact') onContact?.();
                                }}
                                className="text-gray-600 hover:text-black font-medium text-sm transition-colors"
                            >
                                {item}
                            </button>
                        ))}
                        {user && (
                            <button
                                onClick={onOpenGallery}
                                className="text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors"
                            >
                                My Drawings
                            </button>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <button
                                className="flex items-center gap-2 text-sm font-semibold text-gray-900 bg-gray-100 pl-2 pr-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                onClick={onSelectAvatar}
                            >
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <img src={`/pfps/${['dinosaur', 'cat'].includes(selectedAvatar) ? `${selectedAvatar}_v2` : selectedAvatar}.png`} alt="Avatar" className="w-full h-full object-contain filter drop-shadow-sm" />
                                </div>
                                <span>{user.displayName || user.email?.split('@')[0]}</span>
                            </button>

                            <button
                                onClick={onSignOut}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onLogin}
                                className="text-gray-900 font-semibold text-sm hover:opacity-70 transition-opacity underline decoration-2 decoration-transparent hover:decoration-black underline-offset-4"
                            >
                                Log In
                            </button>
                            <button
                                onClick={onSignup}
                                className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-black hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
