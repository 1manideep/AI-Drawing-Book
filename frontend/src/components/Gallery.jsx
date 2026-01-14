import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';

const Gallery = ({ onBack, onResume, onLogin }) => {
    const [drawings, setDrawings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAuthenticated(true);

                try {
                    // 1. Query for 'userId' (CamelCase - New)
                    const q1 = query(collection(db, "drawings"), where("userId", "==", user.uid));
                    // 2. Query for 'userID' (CapitalID - Old/Screenshot)
                    const q2 = query(collection(db, "drawings"), where("userID", "==", user.uid));

                    // Run parallel queries to ensure we get ALL drawings regardless of schema version
                    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

                    // Merge results by ID to avoid duplicates
                    const merged = new Map();
                    [...snap1.docs, ...snap2.docs].forEach(doc => {
                        merged.set(doc.id, { id: doc.id, ...doc.data() });
                    });

                    const fetched = Array.from(merged.values());

                    // Sort by newest first
                    fetched.sort((a, b) => {
                        const tA = a.lastUpdated?.seconds || 0;
                        const tB = b.lastUpdated?.seconds || 0;
                        return tB - tA;
                    });

                    setDrawings(fetched);
                } catch (error) {
                    console.error("Fetch error:", error);
                    // Silent error handling for UI, basic retry or alert could go here
                } finally {
                    setLoading(false);
                }
            } else {
                setIsAuthenticated(false);
                setLoading(false);
                setDrawings([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // Helper Date Formatter
    const formatDate = (seconds) => {
        if (!seconds) return "Just now";
        return new Date(seconds * 1000).toLocaleDateString([], {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen relative"
                style={{
                    background: `
                        radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                        radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                        #ffffff
                    `
                }}
            >
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="font-mono text-sm text-gray-500">Loading your masterpieces...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative"
                style={{
                    background: `
                        radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                        radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                        #ffffff
                    `
                }}
            >
                <h1 className="text-3xl font-bold mb-4 text-gray-900">Please Log In</h1>
                <p className="mb-8 text-gray-600">You need to be logged in to see your drawings.</p>
                <div className="flex gap-4">
                    <button onClick={onBack} className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-full font-bold shadow-sm hover:bg-gray-50">Go Back</button>
                    <button onClick={onLogin} className="px-8 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform">Log In</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 p-8 font-sans text-gray-900"
            style={{
                background: `
                    radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                    radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                    #ffffff
                `
            }}
        >
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-sm hover:shadow-md transition-all border border-white"
                        >
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <h1 className="text-4xl font-['Anton'] uppercase tracking-wide">My Drawings <span className="text-2xl ml-2">({drawings.length})</span></h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {drawings.map(d => (
                        <div
                            key={d.id}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            onClick={() => onResume(d)}
                        >
                            <div className="aspect-[4/3] bg-gray-50 p-6 flex items-center justify-center relative overflow-hidden">
                                {d.imageUrl || d.thumbnailUrl ? (
                                    <img
                                        src={d.imageUrl || d.thumbnailUrl}
                                        alt="Art"
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400 font-mono">No Preview</span>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-indigo-600 transition-colors">
                                    {d.prompt || "Untitled"}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                        {formatDate(d.lastUpdated?.seconds)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {drawings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">🎨</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No drawings yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md">Your canvas is blank! Start a new drawing to fill up your gallery.</p>
                        <button
                            onClick={onBack}
                            className="px-8 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg"
                        >
                            Start Drawing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
