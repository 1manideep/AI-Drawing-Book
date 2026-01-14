import React from 'react';

const GallerySimple = ({ onBack, onLogin }) => {
    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center pt-32 p-8">
            <h1 className="text-4xl font-bold mb-4">Gallery Works!</h1>
            <p className="mb-8">If you see this, the routing is fine. The issue is in the main Gallery code.</p>
            <div className="flex gap-4">
                <button onClick={onBack} className="bg-white px-6 py-3 rounded-full font-bold shadow-sm">
                    Go Back
                </button>
                <button onClick={onLogin} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-sm">
                    Log In
                </button>
            </div>
        </div>
    );
};

export default GallerySimple;
