"use client";

import { useState, useEffect } from "react";
import { useLifelineStore } from "@/store/useLifelineStore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Delete, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RescueCheckIn() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const { resetTimer, lockVault, emergencyPin } = useLifelineStore();
    const router = useRouter();

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleSubmit = () => {
        if (pin === emergencyPin) {
            setSuccess(true);
            resetTimer(); // Reset the 72h timer
            lockVault(); // Re-lock the vault for security
            setTimeout(() => {
                router.push("/");
            }, 3000);
        } else {
            setError(true);
            setPin("");
            setTimeout(() => setError(false), 1000);
        }
    };

    useEffect(() => {
        if (pin.length === 4) {
            handleSubmit();
        }
    }, [pin]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-50" />

            <AnimatePresence>
                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="z-10 text-center space-y-6"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.5)]"
                        >
                            <ShieldCheck className="w-16 h-16 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-green-500 tracking-wider uppercase">Rescue Confirmed</h1>
                        <p className="text-gray-400">Dead Man's Switch has been reset.</p>
                        <p className="text-sm text-gray-500 font-mono">Redirecting to Dashboard...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="z-10 w-full max-w-sm space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto border border-blue-500/50 mb-4">
                                <ShieldCheck className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold uppercase tracking-widest">Rescuer Check-In</h1>
                            <p className="text-gray-500 text-sm">Enter Authorized PIN to disable alert.</p>
                        </div>

                        {/* PIN Display */}
                        <div className="flex justify-center gap-4 my-8">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i
                                        ? "bg-blue-500 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                                        : "bg-gray-800 border border-gray-700"
                                        } ${error ? "bg-red-500 animate-shake" : ""}`}
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-500 text-center text-sm font-bold uppercase animate-pulse">Incorrect PIN</p>}

                        {/* PIN Pad */}
                        <div className="grid grid-cols-3 gap-4 px-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleNumberClick(num.toString())}
                                    className="h-16 rounded-full bg-gray-900/50 border border-gray-800 hover:bg-gray-800 hover:border-gray-600 text-2xl font-bold transition-all active:scale-95"
                                >
                                    {num}
                                </button>
                            ))}
                            <div /> {/* Spacer */}
                            <button
                                onClick={() => handleNumberClick("0")}
                                className="h-16 rounded-full bg-gray-900/50 border border-gray-800 hover:bg-gray-800 hover:border-gray-600 text-2xl font-bold transition-all active:scale-95"
                            >
                                0
                            </button>
                            <button
                                onClick={handleDelete}
                                className="h-16 rounded-full bg-transparent text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                                <Delete className="w-8 h-8" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
