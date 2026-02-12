"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useLifelineStore } from "@/store/useLifelineStore";

interface SafetyCountdownProps {
    timer: number;
    initialTime: number;
    onReset: (batteryInfo?: { level: number; isCharging: boolean }) => void;
    isTimerRunning: boolean;
}

export const SafetyCountdown: React.FC<SafetyCountdownProps> = ({
    timer,
    initialTime,
    onReset,
    isTimerRunning,
}) => {
    const { currentNote, setNote } = useLifelineStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncSuccess, setShowSyncSuccess] = useState(false);

    // Time formatting
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Determine Visual Gravity Color
    const getStatusColor = () => {
        const hoursRemaining = timer / 3600;
        if (hoursRemaining > 24) return "text-green-500"; // Safe
        if (hoursRemaining > 1) return "text-orange-500"; // Warning
        return "text-red-500"; // Critical
    };

    const getRingColor = () => {
        const hoursRemaining = timer / 3600;
        if (hoursRemaining > 24) return "stroke-green-500";
        if (hoursRemaining > 1) return "stroke-orange-500";
        return "stroke-red-500";
    };

    // Circular Progress Calculation
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    // Progress drains as time decreases. 
    // Full time = full circle. 0 time = empty circle.
    const progress = (timer / initialTime) * circumference;
    const strokeDashoffset = circumference - progress;

    const handleSafeClick = async () => {
        if (isSyncing) return;

        // Immediate "Optimistic" UI update
        setIsSyncing(true);

        // Capture Battery Info
        let batteryInfo = undefined;
        if ('getBattery' in navigator) {
            try {
                // @ts-ignore - Navigator.getBattery is not yet in standard TS types
                const battery = await navigator.getBattery();
                batteryInfo = {
                    level: battery.level * 100,
                    isCharging: battery.charging
                };
            } catch (e) {
                console.error("Battery status unavailable", e);
            }
        }

        // Simulate network sync/offline handling
        setTimeout(() => {
            onReset(batteryInfo); // Actual store update
            setIsSyncing(false);
            setShowSyncSuccess(true);
            setTimeout(() => setShowSyncSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 relative">
            {/* Circular Countdown */}
            <div className="relative w-80 h-80 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="160"
                        cy="160"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-800"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "linear" }}
                        cx="160"
                        cy="160"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        className={`${getRingColor()} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-500`}
                    />
                </svg>

                {/* Central Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        key={timer}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className={`text-5xl font-mono font-bold tracking-tighter ${getStatusColor()} drop-shadow-lg`}
                    >
                        {formatTime(timer)}
                    </motion.div>
                    <p className="text-slate-500 text-sm tracking-widest uppercase mt-2 font-semibold">
                        {isTimerRunning ? "ACTIVE MONITORING" : "TIMER PAUSED"}
                    </p>
                </div>
            </div>

            {/* Safety Note Input */}
            <div className="w-full max-w-xs relative z-10">
                <textarea
                    value={currentNote}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder='Optional: Where are you? (e.g. "Heading to dinner")'
                    className="w-full bg-white/10 backdrop-blur-md border border-slate-700 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 mb-4 focus:outline-none focus:border-green-500/50 transition-colors resize-none h-24"
                    disabled={isSyncing}
                />
            </div>

            {/* Fat Finger Protection Button */}
            <div className="w-full max-w-xs relative z-10">
                <button
                    onClick={handleSafeClick}
                    disabled={isSyncing}
                    className={`w-full h-20 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${isSyncing
                        ? "bg-slate-800 text-slate-400 cursor-wait border-2 border-slate-700"
                        : "bg-white text-slate-900 hover:bg-slate-200 border-2 border-transparent hover:border-slate-400/50"
                        }`}
                >
                    {isSyncing ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span>SYNCING...</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                            <span>I'M SAFE - RESET</span>
                        </>
                    )}
                </button>

                {/* Offline / Sync Grace Note */}
                <AnimatePresence>
                    {showSyncSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-12 left-0 right-0 text-center"
                        >
                            <span className="text-green-500 text-xs font-bold bg-green-900/20 px-3 py-1 rounded-full border border-green-900/50">
                                ✓ CHECK-IN SYNCED TO VAULT
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
