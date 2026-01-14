import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
// Storage removed to avoid Blaze plan requirement
import { Loader2, Save, ArrowUp, Plus, Printer } from 'lucide-react'; // Import icons
import { floodFill } from '../utils/floodFill';
import { initPyodide, runPythonProcess } from '../utils/pyodide';
import rough from 'roughjs/bundled/rough.esm';
// Import the python script as raw text
import processingScript from '../python/processing_script.py?raw';
import 'wired-elements';
import OpenAI from 'openai';
import BubblePop from './BubblePop';

export default function CanvasBoard({ initialPrompt, initialFile, initialDrawing, onBack, onSaved, onLogin, selectedAvatar }) {
    const canvasRef = useRef(null);
    const roughCanvasRef = useRef(null);

    const [imageSrc, setImageSrc] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    // const [dots, setDots] = useState([]);
    const [palette, setPalette] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    // const [connectedDots, setConnectedDots] = useState([]);

    const [activeTool, setActiveTool] = useState('paint'); // Default to paint now
    const [paintColor, setPaintColor] = useState('#ff0000');
    const [customColors, setCustomColors] = useState(['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD']);
    const [isFunny, setIsFunny] = useState(false);

    // Use a ref to prevent double-execution in React Strict Mode if desired, 
    // though simpler here to just run if imageSrc is null.
    const hasStartedRef = useRef(false);

    // User Settings - Using Env Var now
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // Initialize Pyodide on mount
    useEffect(() => {
        const loadEngine = async () => {
            // Just pre-loading, silent unless error
            try {
                await initPyodide();
            } catch (err) {
                console.error("Failed to load Python Engine", err);
            }
        };
        loadEngine();
    }, []);

    // Initial Trigger from Props (Consolidated to prevent race conditions)
    useEffect(() => {
        if (hasStartedRef.current) return;

        if (initialDrawing) {
            // Priority 1: Resume from saved drawing
            console.log("Resuming drawing...", initialDrawing.id);
            hasStartedRef.current = true;

            if (initialDrawing.imageUrl) {
                // Ensure we handle Base64 properly
                setImageSrc(initialDrawing.imageUrl);
                // Provide a default robust palette since we don't have the original generation data
                setPalette(['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#000000', '#FFFFFF', '#808080']);
            }
        } else if (initialFile) {
            // Priority 2: Upload new file
            hasStartedRef.current = true;
            processUploadedFile(initialFile);
        } else if (initialPrompt) {
            // Priority 3: Generate new from prompt
            hasStartedRef.current = true;
            generateFromPrompt(initialPrompt);
        }
    }, [initialPrompt, initialFile, initialDrawing]);



    const [isSaving, setIsSaving] = useState(false);

    const saveToGallery = async () => {
        if (!auth.currentUser || !canvasRef.current || isSaving) return;
        setIsSaving(true);
        // setStatus("Saving your masterpiece..."); // Optional: local status if valid

        try {
            // 1. Convert Canvas to Base64 (JPEG compressed to fit in Firestore 1MB limit)
            const canvas = canvasRef.current;
            // Use JPEG with 0.2 quality to ensure small size (it's B&W line art, so it compresses well)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.2);

            // Check size (Base64 string length roughly represents size)
            if (dataUrl.length > 1000000) {
                throw new Error("Drawing is too complex to save (Limit: 1MB).");
            }

            // 2. Save/Update Firestore directly
            if (initialDrawing?.id) {
                // Update existing
                const docRef = doc(db, "drawings", initialDrawing.id);
                await updateDoc(docRef, {
                    imageUrl: dataUrl,
                    thumbnailUrl: dataUrl, // Re-use same string
                    lastUpdated: serverTimestamp()
                });
            } else {
                // Create new
                await addDoc(collection(db, "drawings"), {
                    userId: auth.currentUser.uid,
                    prompt: initialPrompt || "Untitled",
                    imageUrl: dataUrl,
                    thumbnailUrl: dataUrl,
                    createdAt: serverTimestamp(),
                    lastUpdated: serverTimestamp(),
                    status: 'active'
                });
            }

            // setStatus("Saved!");
            // await new Promise(resolve => setTimeout(resolve, 1000)); // Show success message for 1s
            onSaved(); // Navigate to Gallery immediately
        } catch (error) {
            console.error("Error saving:", error);
            alert("Failed to save: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };


    const processImageWithPyodide = async (arrayBuffer) => {
        try {
            setStatus("Processing image in browser...");
            const pyodide = await initPyodide();

            // Pass the image bytes to Python
            const uint8Array = new Uint8Array(arrayBuffer);
            pyodide.globals.set("image_bytes", uint8Array);

            // Run the script to define functions
            await pyodide.runPythonAsync(processingScript);

            // Execute the function explicitly
            const result = await pyodide.runPythonAsync("process_image_bundle(image_bytes)");

            // Convert PyProxy to JS object
            return result.toJs({ dict_converter: Object.fromEntries });
        } catch (err) {
            console.error("Pyodide Error:", err);
            throw err;
        }
    };

    const processUploadedFile = async (file) => {
        setLoading(true);
        setStatus("Reading file...");
        try {
            const arrayBuffer = await file.arrayBuffer();
            const data = await processImageWithPyodide(arrayBuffer);

            if (data.image) {
                setImageSrc(data.image);
                // setDots(data.dots || []);
                // Ensure we have a palette, fallback to rainbow if empty
                const generatedPalette = data.palette && data.palette.length > 0 ? data.palette : ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#000000', '#FFFFFF', '#808080'];
                setPalette(generatedPalette);
                if (data.width && data.height) {
                    setCanvasSize({ width: data.width, height: data.height });
                }
                // setConnectedDots([]);
            }
        } catch (error) {
            console.error("Error processing image:", error);
            alert(`Failed to process image: ${error.message}`);
            // If failed, maybe go back?
        } finally {
            setLoading(false);
            setStatus("");
        }
    };

    const generateFromPrompt = async (promptText) => {
        if (!promptText) return;
        if (!apiKey) {
            alert("No API Key configured. Please check .env file.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setStatus(`Generating "${promptText}"...`);

        try {
            const openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true
            });

            const fullPrompt = `Create a children's coloring page of: ${promptText}. The image must be pure line art only with thick, clear outlines and wide enough spaces for coloring. It should be an uncluttered scene with plenty of negative space and a pure white background. Use a cartoonish, vector-style drawing. STRICTLY no shading, no gradients, no greyscale, no complex textures, no gray, colors:2. The output MUST contain only a single main subject.`;

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: fullPrompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            });

            const b64Json = response.data[0].b64_json;

            // Convert base64 json to Uint8Array for Pyodide
            setStatus("Processing generated image...");
            const binaryString = atob(b64Json);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const data = await processImageWithPyodide(bytes.buffer);

            if (data.image) {
                setImageSrc(data.image);
                // setDots(data.dots || []);
                setPalette(data.palette || []);
                if (data.width && data.height) {
                    setCanvasSize({ width: data.width, height: data.height });
                }
                // setConnectedDots([]);
            }

        } catch (err) {
            console.error(err);
            alert("Error: " + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
            setStatus("");
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        // roughCanvasRef.current = rough.canvas(canvas); // Not actively used for painting, causing potential conflicts

        if (imageSrc) {
            const img = new Image();
            img.onload = () => {
                // Check if we need to resize the canvas to match the image
                if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                    console.log(`Resizing canvas from ${canvas.width}x${canvas.height} to ${img.naturalWidth}x${img.naturalHeight}`);
                    setCanvasSize({ width: img.naturalWidth, height: img.naturalHeight });
                    return; // Retrigger effect with new size
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear to transparent

                // Ensure background is pure white (prevents transparency issues with floodFill)
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw image at full opacity
                ctx.globalAlpha = 1.0;
                // Draw exact match (since we resized above)
                ctx.drawImage(img, 0, 0);

                window.currentPuzzleImage = img;
            };
            img.src = imageSrc;
        }

    }, [imageSrc, canvasSize]);

    /* 
    useEffect(() => {
        if (!roughCanvasRef.current || connectedDots.length < 2) return;
        const rc = roughCanvasRef.current;
        const last = connectedDots[connectedDots.length - 1];
        const prev = connectedDots[connectedDots.length - 2];
    
        rc.line(prev.x, prev.y, last.x, last.y, {
            roughness: 2.5,
            stroke: 'black',
            strokeWidth: 3,
            bowing: 1.5,
            seed: Math.random()
        });
    }, [connectedDots]);
    */


    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `scribble-${Date.now()}.jpg`;
        link.href = canvasRef.current.toDataURL('image/jpeg', 0.8);
        link.click();
    };

    const handleCanvasClick = (e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        // Fix: Use offsetWidth/Height for reliable scaling calculation
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        /*
        if (activeTool === 'connect') {
            const nextDotIndex = connectedDots.length;
            if (nextDotIndex < dots.length) {
                const targetDot = dots[nextDotIndex];
                const dist = Math.sqrt((x - targetDot.x) ** 2 + (y - targetDot.y) ** 2);

                if (dist < 35) {
                    const newConnected = [...connectedDots, targetDot];
                    setConnectedDots(newConnected);

                    if (newConnected.length === dots.length) {
                        const ctx = canvasRef.current.getContext('2d');
                        const img = window.currentPuzzleImage;
                        if (img) {
                            ctx.globalAlpha = 1.0;
                            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                        }
                        setTimeout(() => setActiveTool('paint'), 500);
                        alert("Great Job! Now color it in!");
                    }
                }
            }
        } else */ if (activeTool === 'paint') {
            floodFill(canvasRef.current, Math.floor(x), Math.floor(y), paintColor);
        }
    };

    // Loading View - Chat Style
    if (loading) {
        return (
            <div
                className="min-h-screen w-full font-sans text-gray-900 flex flex-col items-center justify-center p-4 pt-24 relative overflow-hidden"
                style={{
                    background: `
                        radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                        radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                        #ffffff
                    `
                }}
            >
                <div className="w-full max-w-4xl bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col gap-6 min-h-[600px] border border-white/60">

                    {/* Chat Bubbles Header */}
                    <div className="flex justify-end items-start w-full gap-4">
                        <div className="bg-white px-6 py-4 rounded-2xl rounded-tr-sm shadow-sm max-w-lg">
                            <p className="font-medium text-gray-800">{initialPrompt || "A surprise doodle!"}</p>
                        </div>
                        <div className="w-14 h-14 flex items-center justify-center">
                            <img src={`/pfps/${['dinosaur', 'cat'].includes(selectedAvatar || 'dog') ? `${selectedAvatar || 'dog'}_v2` : (selectedAvatar || 'dog')}.png`} alt="User" className="w-full h-full object-contain filter drop-shadow-sm" />
                        </div>
                    </div>

                    {/* Status Label */}
                    <div className="text-indigo-600 font-bold text-lg animate-pulse pl-2">
                        Creating Doodle...
                    </div>

                    {/* Main Content Area (White Box) */}
                    <div className="flex-1 bg-white rounded-3xl shadow-inner border border-white/50 flex items-center justify-center min-h-[400px]">
                        <div className="relative flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // Playground View (Split Layout)
    return (
        <div
            className="flex h-screen overflow-hidden relative"
            style={{
                background: `
                    radial-gradient(circle at 70% -5%, rgba(160, 180, 255, 0.9) 0%, rgba(255, 255, 255, 0) 24%),
                    radial-gradient(circle at 40% 10%, rgba(255, 140, 230, 0.9) 0%, rgba(255, 255, 255, 0) 55%),
                    #ffffff
                `
            }}
        >
            <BubblePop />

            {/* Left: Canvas Area (80%) */}
            <div className="w-4/5 h-full p-8 flex items-center justify-center relative z-10 pointer-events-none">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-gray-600 hover:text-black hover:shadow-md transition-all z-20 md:hidden pointer-events-auto"
                >
                    ← Back
                </button>

                <div className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden bg-white border-2 border-black max-w-full max-h-full pointer-events-auto">
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        onClick={handleCanvasClick}
                        className={`${activeTool === 'paint' ? 'cursor-cell' : 'cursor-crosshair'} max-w-full max-h-full object-contain block`}
                    />
                </div>
            </div>

            {/* Right: Tools Panel (20%) - Glassmorphism */}
            {/* Right: Tools Panel (20%) - Floating Card, Left Aligned */}
            <div className="w-[28%] h-[85vh] self-center mr-[15%] rounded-[1.5rem] border-2 border-white/30 flex flex-col shadow-[-10px_10px_30px_rgba(0,0,0,0.05)] relative z-10 pointer-events-none overflow-hidden">
                <div className="px-5 pt-4 pb-0"></div>

                <div className="px-5 py-2 flex flex-col gap-1 overflow-y-auto flex-1 pointer-events-auto no-scrollbar">
                    {/* Tools Switcher */}
                    <div className="flex flex-col gap-1">
                        <button
                            className={`w-full font-sans font-bold text-lg transition-all flex items-center justify-start px-2 gap-2
                        ${activeTool === 'paint' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'}
                     `}
                            onClick={() => setActiveTool('paint')}
                        >
                            Paint Bucket
                        </button>
                    </div>

                    {/* Color Palette */}
                    {activeTool === 'paint' && (

                        <div className="flex flex-col gap-0.5 bg-white/40 p-2 rounded-xl border border-white/60 shadow-sm animate-fade-in-up mt-2">
                            <label className="font-hand font-bold text-xs text-gray-600 text-left w-full pl-1 mb-0.5">Suggested Colors</label>
                            <div className="grid grid-cols-5 gap-0.5 justify-items-center">
                                {palette.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPaintColor(color)}
                                        style={{ backgroundColor: color }}
                                        className={`w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${paintColor === color ? 'border-black ring-2 ring-offset-2 ring-indigo-300' : 'border-white'}`}
                                        title={color}
                                    />
                                ))}
                            </div>

                            <div className="h-px bg-gray-300/50 my-0.5"></div>

                            {/* Custom Palette */}
                            <label className="font-hand font-bold text-xs text-gray-600 text-left w-full pl-1 mb-0.5">Your Palette</label>
                            <div className="grid grid-cols-5 gap-0.5 justify-items-center">
                                {customColors.map((cColor, idx) => (
                                    <div key={idx} className={`relative w-8 h-8 rounded-full overflow-hidden border-2 shadow-sm hover:scale-110 transition-transform ${paintColor === cColor ? 'border-black ring-2 ring-offset-2 ring-indigo-300' : 'border-white'}`}>
                                        <input
                                            type="color"
                                            value={cColor}
                                            onClick={() => setPaintColor(cColor)}
                                            onChange={(e) => {
                                                const newColor = e.target.value;
                                                const newColors = [...customColors];
                                                newColors[idx] = newColor;
                                                setCustomColors(newColors);
                                                setPaintColor(newColor);
                                            }}
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Bottom Actions */}
                {/* Bottom Actions */}
                <div className="px-5 py-3 border-t border-white/30 flex flex-col gap-4 pointer-events-auto">
                    <button
                        onClick={handleDownload}
                        className="w-full font-sans font-bold text-base text-indigo-500 hover:text-indigo-700 transition-all flex items-center justify-start px-2 gap-2"
                    >
                        Print / Download
                    </button>

                    <button
                        disabled={isSaving}
                        onClick={() => {
                            if (auth.currentUser) {
                                saveToGallery();
                            } else {
                                if (canvasRef.current) {
                                    try {
                                        const data = canvasRef.current.toDataURL('image/jpeg', 0.8);
                                        sessionStorage.setItem('pending_drawing', data);
                                        sessionStorage.setItem('pending_drawing_dims', JSON.stringify(canvasSize));
                                    } catch (e) {
                                        console.error("Failed to save pending drawing", e);
                                    }
                                }
                                onLogin();
                            }
                        }}
                        className={`w-full font-sans font-bold text-base flex items-center justify-start px-2 gap-2 transition-all ${isSaving ? 'text-green-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800'}`}
                    >
                        {isSaving ? (
                            <>Saving...</>
                        ) : (
                            <>{auth.currentUser ? "Save to My Drawings" : "Login to Save"}</>
                        )}
                    </button>

                    <button
                        onClick={onBack}
                        className="w-full font-sans font-bold text-base text-gray-500 hover:text-gray-700 transition-all flex items-center justify-start px-2 gap-2"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
