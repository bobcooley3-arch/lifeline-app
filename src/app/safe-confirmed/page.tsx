"use client";

import { CheckCircle, Home, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TRAVEL_TIPS = [
    "Share your itinerary with trusted contacts.",
    "Keep a backup power bank fully charged.",
    "Avoid unlit streets at night.",
    "Trust your instincts; if it feels off, leave.",
    "Keep digital copies of documents in the Vault."
];

export default function SafeConfirmed() {
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TRAVEL_TIPS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Graphism */}
            <div className="absolute inset-0 bg-green-900/10 radial-gradient-green" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center space-y-8 z-10 max-w-sm text-center"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full" />
                    <CheckCircle className="w-32 h-32 text-green-500 relative z-10" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Safe Zone Confirmed</h1>
                    <p className="text-green-400 font-mono text-xl">Next Check-in: 72:00:00</p>
                </div>

                {/* Tips Carousel */}
                <div className="h-24 flex items-center justify-center w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tipIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-gray-400 text-sm italic px-8"
                        >
                            "{TRAVEL_TIPS[tipIndex]}"
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Persistent Home Anchor */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <Link
                    href="/"
                    className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors cursor-pointer group"
                >
                    <div className="p-3 rounded-full bg-gray-900 group-hover:bg-gray-800 transition-colors border border-gray-800">
                        <Home className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Return Home</span>
                </Link>
            </div>
        </div>
    );
}
