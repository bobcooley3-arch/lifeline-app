"use client";

import { useState } from "react";
import { Lock, FileText, Upload, Fingerprint, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLifelineStore } from "@/store/useLifelineStore";
import { motion, AnimatePresence } from "framer-motion";

export default function SecureVault() {
    const { isUnlocked, unlockVault, faceLogs } = useLifelineStore();
    const [isScanning, setIsScanning] = useState(false);

    const handlescan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            unlockVault();
        }, 2000);
    };

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* Header */}
            <div className="p-4 flex items-center justify-center border-b border-gray-800">
                <h1 className="font-bold text-lg">Secure Vault</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {!isUnlocked ? (
                        <motion.div
                            key="locked"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center space-y-8 text-center"
                        >
                            <Lock className="w-16 h-16 text-gray-500 mb-4" />
                            <h2 className="text-2xl font-bold">Biometric Required</h2>
                            <p className="text-gray-400">Scan fingerprint to access encrypted documents.</p>

                            <button
                                onClick={handlescan}
                                disabled={isScanning}
                                className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${isScanning ? "border-green-500 text-green-500 animate-pulse" : "border-gray-600 text-gray-600 hover:text-white hover:border-white"}`}
                            >
                                <Fingerprint className="w-12 h-12" />
                            </button>
                            {isScanning && <p className="text-green-500 text-sm">Scanning...</p>}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="unlocked"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full h-screen overflow-y-auto pb-40 space-y-6"
                        >
                            {/* Documents Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Secure Documents</h3>
                                <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-4">
                                    <div className="bg-blue-900/40 p-3 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Passport_Scan.pdf</h3>
                                        <p className="text-xs text-gray-500">Added 2 days ago • 1.2 MB</p>
                                    </div>
                                </div>

                                <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-4">
                                    <div className="bg-purple-900/40 p-3 rounded-lg">
                                        <FileText className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Travel_Insurance.pdf</h3>
                                        <p className="text-xs text-gray-500">Added 5 days ago • 0.8 MB</p>
                                    </div>
                                </div>

                                <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-4 border border-dashed border-gray-800 justify-center group hover:border-gray-600 transition-colors cursor-pointer">
                                    <Upload className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
                                    <span className="text-gray-500 text-sm group-hover:text-gray-300">Upload Document</span>
                                </div>
                            </div>

                            {/* Recent Face Logs */}
                            {faceLogs.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent Evidence</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {faceLogs.map((log) => (
                                            <div key={log.id} className="rounded-lg overflow-hidden flex flex-col bg-gray-900 border border-gray-800">
                                                <div className="aspect-square w-full relative">
                                                    <img src={log.image} alt="Log" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="bg-black p-1 text-[10px] text-white flex flex-col gap-0.5">
                                                    <div className="font-bold truncate text-yellow-500 leading-tight">
                                                        {log.note || "No Note"}
                                                    </div>
                                                    <div className="truncate leading-tight">
                                                        {log.lat !== null && log.lng !== null ? (
                                                            <a
                                                                href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-mono text-[9px] text-blue-500 hover:text-blue-400 hover:underline font-bold"
                                                            >
                                                                {log.lat.toFixed(3)}, {log.lng.toFixed(3)}
                                                            </a>
                                                        ) : (
                                                            <span className="font-mono text-[9px] text-gray-500">GPS Pending...</span>
                                                        )}
                                                    </div>
                                                    <div className="opacity-80 truncate leading-tight text-[9px]">
                                                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Persistent Home Anchor */}
                            <div className="pt-8 flex justify-center pb-8">
                                <Link
                                    href="/"
                                    className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors cursor-pointer group"
                                >
                                    <div className="p-3 rounded-full bg-gray-900 group-hover:bg-gray-800 transition-colors border border-gray-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Return Home</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
