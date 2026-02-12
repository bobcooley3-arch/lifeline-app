"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLifelineStore } from "@/store/useLifelineStore";
import { useRouter } from "next/navigation";
import { useGeoLocation } from "@/hooks/useGeoLocation";

export default function LogFace() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const location = useGeoLocation();
    const [note, setNote] = useState("");
    const { addFaceLog } = useLifelineStore();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        let stream: MediaStream | null = null;
        // ... (keep existing camera logic)
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                // COMPRESSION: Use JPEG at 0.6 quality
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
                setCapturedImage(dataUrl);
            }
        }
    };

    const [isSecured, setIsSecured] = useState(false);

    // ... (keep existing capturePhoto)

    const saveEvidence = () => {
        if (capturedImage) {
            addFaceLog({
                id: Date.now().toString(),
                image: capturedImage,
                timestamp: Date.now(),
                lat: location.lat ?? 0.000,
                lng: location.lng ?? 0.000,
                note: note.trim() || undefined
            });
            console.log("Evidence Saved with GPS:", location.lat ?? 0.000, location.lng ?? 0.000);

            // Trigger "Gravity Pull" reset
            setIsSecured(true);
            setTimeout(() => {
                router.push("/");
            }, 3000);
        }
    };

    return (
        <div className="h-full bg-black flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-center z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full pointer-events-none">
                <span className="font-bold text-white tracking-widest uppercase text-sm shadow-sm">Log Evidence</span>
            </div>

            {/* ... (keep existing camera view) ... */}

            {/* Controls */}
            <div className="h-32 bg-black flex items-center justify-between px-8 relative z-20">
                {/* Persistent Home Anchor */}
                <Link href="/" className="text-gray-500 hover:text-white transition-colors p-4">
                    <div className="flex flex-col items-center gap-1">
                        <div className="p-2 rounded-full border border-gray-800 bg-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
                    </div>
                </Link>

                {capturedImage ? (
                    <div className="flex items-center gap-4 flex-1 justify-end">
                        <button
                            onClick={() => {
                                setCapturedImage(null);
                                setNote("");
                            }}
                            className="h-12 px-6 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-900 transition-colors text-sm"
                        >
                            RETAKE
                        </button>
                        <button
                            onClick={saveEvidence}
                            className="h-12 px-6 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors text-sm"
                        >
                            SAVE
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex justify-center pr-12"> {/* Offset for centering */}
                        <button
                            onClick={capturePhoto}
                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 bg-white rounded-full" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
