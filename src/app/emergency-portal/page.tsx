"use client";

import { useLifelineStore } from "@/store/useLifelineStore";
import { useEffect, useState } from "react";
import {
    AlertTriangle, Map, Phone, FileLock, ExternalLink,
    Camera, Radio, Activity, ShieldAlert, Zap, CheckCircle, HelpCircle
} from "lucide-react";
import { SafetyCircleService } from "@/services/SafetyCircleService";

export default function EmergencyPortal() {
    const { faceLogs, sendNudge, checkInHistory, updateIdentity, nudgeActive, nudgeAcknowledged, setNudgeAcknowledged, setNudgeActive, lastNudgeLocation, setLastNudgeLocation, lastNudgeAckTime, setLastNudgeAckTime } = useLifelineStore();
    // Default to local history, but we'll try to fetch cloud data
    const [cloudData, setCloudData] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(false);

    // Use cloud data if valid, otherwise fallback to local store (simulated sync)
    // In a real app, we'd merge these. For now, cloud sync takes precedence if active.
    const lastCheckIn = cloudData ? {
        timestamp: cloudData.lastCheckIn,
        note: cloudData.note,
        batteryLevel: cloudData.batteryLevel,
        lat: cloudData.location?.lat,
        lng: cloudData.location?.lng
    } : checkInHistory?.[0];

    // Poll /api/pulse every 30s
    useEffect(() => {
        const fetchCloudData = async () => {
            try {
                const data = await SafetyCircleService.fetchPulse();
                if (data && data.lastCheckIn) {
                    setCloudData(data);
                    setIsOnline(true);
                    // Also update local store identity if needed (optional sync back)
                    // if (data.identity) updateIdentity(data.identity);
                }
            } catch (e) {
                console.warn("Polling failed", e);
                setIsOnline(false);
            }
        };

        // Initial fetch
        fetchCloudData();

        const interval = setInterval(fetchCloudData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Listen for cross-tab updates (Nudge Acknowledgment from Sarah)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'lifeline-v3' && e.newValue) {
                const check = JSON.parse(e.newValue);
                // If Sarah acknowledged the nudge, update here
                if (check.state?.nudgeAcknowledged) {
                    setNudgeAcknowledged(true);
                    setNudgeActive(false); // Ensure we stop showing "Nudging..."
                    if (check.state?.lastNudgeLocation) {
                        setLastNudgeLocation(check.state.lastNudgeLocation);
                    }
                    if (check.state?.lastNudgeAckTime) {
                        setLastNudgeAckTime(check.state.lastNudgeAckTime);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [setNudgeAcknowledged, setNudgeActive, setLastNudgeLocation, setLastNudgeAckTime]);

    // Auto-reset "Nudge Received" status after 10 seconds
    useEffect(() => {
        if (nudgeAcknowledged) {
            const timer = setTimeout(() => {
                setNudgeAcknowledged(false);
                setNudgeActive(false); // Reset to ensure clean state
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [nudgeAcknowledged, setNudgeAcknowledged, setNudgeActive]);

    const [timeAgo, setTimeAgo] = useState<string>("");
    const [showHelp, setShowHelp] = useState(false);

    // Update "Time Ago" every minute to keep UI fresh
    useEffect(() => {
        const updateTime = () => {
            if (!lastCheckIn) return;
            const diff = Math.floor((Date.now() - lastCheckIn.timestamp) / 60000);
            if (diff < 1) setTimeAgo("Just now");
            else setTimeAgo(`${diff}m ago`);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [lastCheckIn]);

    const handleNudge = () => {
        console.log("Sending Nudge to lifeline-v3...");
        setNudgeAcknowledged(false); // Reset confirmation if sending again manually
        sendNudge();
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">

            {/* TOP NAVIGATION / BRANDING */}
            <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Activity className="text-emerald-500 w-6 h-6" />
                        <h1 className="font-bold tracking-wider text-slate-300">LIFELINE <span className="text-emerald-500">PORTAL</span></h1>
                    </div>
                    {isOnline ? (
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            UPLINK ACTIVE
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                            <div className="w-2 h-2 bg-slate-500 rounded-full" />
                            OFFLINE MODE
                        </div>
                    )}
                </div>
            </header>

            {/* HELP MODAL */}
            {
                showHelp && (
                    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>

                            <h2 className="text-2xl font-black mb-6 text-center">MISSION CONTROL GUIDE</h2>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <Activity className="w-8 h-8 text-emerald-600 shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-lg">Device Health</h3>
                                        <p className="text-slate-600 text-sm leading-tight">Monitor battery levels. Red pulsing means critical low battery.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Map className="w-8 h-8 text-blue-600 shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-lg">Map Action</h3>
                                        <p className="text-slate-600 text-sm leading-tight">Click 'Open in Google Maps' to get exact coordinates for rescue.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <CheckCircle className="w-8 h-8 text-slate-600 shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-lg">History Log</h3>
                                        <p className="text-slate-600 text-sm leading-tight">Review past check-ins to track movement patterns over time.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowHelp(false)}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                GOT IT!
                            </button>
                        </div>
                    </div>
                )
            }

            <main className="max-w-6xl mx-auto p-6 md:p-8 pb-10 space-y-8 relative">
                <button
                    onClick={() => setShowHelp(true)}
                    className="absolute top-0 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"
                >
                    <HelpCircle className="w-6 h-6" />
                </button>

                {/* HERO: STATUS CARD */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* PRIMARY STATUS (Large Card) */}
                    <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm text-white rounded-2xl p-8 shadow-2xl shadow-emerald-900/10 border border-white/10 border-l-8 border-l-emerald-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl opacity-50 -translate-y-16 translate-x-16 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Status</span>
                                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    LIVE
                                </div>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                                &ldquo;{lastCheckIn?.note || "No status note available."}&rdquo;
                            </h2>

                            <div className="flex items-center gap-4 text-slate-400 font-medium">
                                <span className="flex items-center gap-2">
                                    <Radio className="w-4 h-4" />
                                    {timeAgo || "--"}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                <span>Target: Sarah</span>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS SIDEBAR */}
                    <div className="space-y-4 flex flex-col justify-center">
                        <button
                            onClick={handleNudge}
                            disabled={nudgeActive} // Disable while sending
                            className={`group w-full border text-white p-4 rounded-xl flex items-center gap-4 transition-all active:scale-95
                                ${nudgeActive
                                    ? 'bg-yellow-900/50 border-yellow-500/50 cursor-wait'
                                    : nudgeAcknowledged
                                        ? 'bg-emerald-900/50 border-emerald-500/50 hover:bg-emerald-900/80'
                                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800'
                                }
                            `}
                        >
                            <div className={`p-3 rounded-lg transition-colors
                                ${nudgeActive
                                    ? 'bg-yellow-500 text-black animate-pulse'
                                    : nudgeAcknowledged
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-500 group-hover:text-black'
                                }
                            `}>
                                {nudgeActive ? <Radio className="w-5 h-5 animate-spin" /> : nudgeAcknowledged ? <CheckCircle className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">
                                    {nudgeActive
                                        ? "⏳ Nudging Sarah..."
                                        : nudgeAcknowledged
                                            ? "✅ Sarah Confirmed Safe"
                                            : "Send Nudge"
                                    }
                                </div>
                                <div className="text-xs text-slate-500">
                                    {nudgeActive
                                        ? "Waiting for response..."
                                        : nudgeAcknowledged
                                            ? (
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <span className="opacity-90">
                                                        {lastNudgeLocation ? `${lastNudgeLocation.lat.toFixed(4)}, ${lastNudgeLocation.lng.toFixed(4)}` : "Location Pending..."}
                                                    </span>
                                                    {lastNudgeAckTime && (
                                                        <span className="text-[10px] text-emerald-900 font-mono bg-emerald-400 px-1 rounded inline-block self-start">
                                                            {new Date(lastNudgeAckTime).toLocaleTimeString()}
                                                        </span>
                                                    )}
                                                    {lastNudgeLocation && (
                                                        <div
                                                            role="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`https://www.google.com/maps/search/?api=1&query=${lastNudgeLocation.lat},${lastNudgeLocation.lng}`, '_blank');
                                                            }}
                                                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline font-bold"
                                                        >
                                                            <Map className="w-3 h-3" /> View on Map
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                            : "Vibrate target device"
                                    }
                                </div>
                            </div>
                        </button>

                        <button className="group w-full bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-white p-4 rounded-xl flex items-center gap-4 transition-all hover:bg-slate-800 active:scale-95">
                            <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <ShieldAlert className="w-5 h-5 text-blue-500 group-hover:text-white" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Escalate Emergency</div>
                                <div className="text-xs text-slate-500">Contact authorities</div>
                            </div>
                        </button>
                    </div>

                </section>

                {/* INTEL GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* DEVICE HEALTH TILE */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-2 rounded-lg ${lastCheckIn?.batteryLevel && lastCheckIn.batteryLevel <= 20 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                <Activity className={`${lastCheckIn?.batteryLevel && lastCheckIn.batteryLevel <= 20 ? 'text-red-500 animate-pulse' : 'text-green-500'} w-6 h-6`} />
                            </div>
                            {(lastCheckIn as any)?.isCharging && (
                                <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-yellow-400" /> CHARGING
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-200 mb-1">Device Health</h3>

                        <div className="flex items-end gap-2 mb-2">
                            <span className={`text-4xl font-black ${lastCheckIn?.batteryLevel && lastCheckIn.batteryLevel <= 20 ? 'text-red-500' : 'text-green-500'}`}>
                                {lastCheckIn?.batteryLevel ? Math.round(lastCheckIn.batteryLevel) : '--'}%
                            </span>
                            <span className="text-slate-500 text-sm mb-1 font-medium">Battery</span>
                        </div>

                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${lastCheckIn?.batteryLevel && lastCheckIn.batteryLevel <= 20 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                                style={{ width: `${lastCheckIn?.batteryLevel || 0}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-right">
                            Last Sync: {lastCheckIn?.batteryLevel ? "Success" : "Pending"}
                        </p>
                    </div>

                    {/* LOCATION TILE */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-blue-500/10 p-2 rounded-lg">
                                    <Map className="text-blue-500 w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-1">Last Coordinates</h3>

                            <div className="mb-8">
                                <p className="text-slate-400 text-sm font-mono mb-2">
                                    {lastCheckIn?.lat?.toFixed(4) || "---"}, {lastCheckIn?.lng?.toFixed(4) || "---"}
                                </p>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                                    <div className="h-full bg-blue-500 w-2/3" />
                                </div>
                                <p className="text-[10px] text-slate-500 text-right">GPS Signal Strength: Good</p>
                            </div>
                        </div>

                        <button
                            onClick={() => lastCheckIn?.lat && window.open(`https://www.google.com/maps/search/?api=1&query=${lastCheckIn.lat},${lastCheckIn.lng}`, '_blank')}
                            className="w-full py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-3 h-3" />
                            OPEN IN GOOGLE MAPS
                        </button>
                    </div>

                    {/* VAULT TILE */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-purple-500/10 p-2 rounded-lg">
                                <FileLock className="text-purple-500 w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded">3 FILES</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-200 mb-1">Identity Vault</h3>
                        <p className="text-slate-400 text-sm mb-4">Passport, Insurance, Contacts.</p>
                        <button className="w-full py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-bold transition-colors">
                            ACCESS SECURE FILES
                        </button>
                    </div>

                    {/* FORENSICS TILE */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-amber-500/10 p-2 rounded-lg">
                                <Camera className="text-amber-500 w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">LOGS</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-200 mb-1">Forensic Trail</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            {faceLogs.length} evidence captures stored.
                        </p>
                        <div className="flex -space-x-2">
                            {[...Array(Math.min(3, faceLogs.length))].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900" />
                            ))}
                            {faceLogs.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-400">
                                    +{faceLogs.length - 3}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* HISTORY LOG SECTION */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-slate-800 p-2 rounded-lg">
                            <CheckCircle className="text-slate-400 w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300 tracking-wide">CHECK-IN HISTORY</h3>
                    </div>

                    <div className="space-y-0 relative border-l-2 border-slate-800 ml-5 pl-8 pb-4">
                        {checkInHistory && checkInHistory.length > 0 ? (
                            checkInHistory.map((checkIn, index) => (
                                <div key={index} className="relative mb-10 last:mb-0 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-slate-950 ${index === 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />

                                    <div className={`bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:bg-slate-900 transition-all group-hover:border-slate-700 ${index === 0 ? 'border-emerald-500/30 bg-emerald-900/10' : ''}`}>
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-white">
                                                    &ldquo;{checkIn.note || "Safe check-in"}&rdquo;
                                                </p>
                                                <p className="text-sm text-slate-500 font-mono flex items-center gap-2">
                                                    {new Date(checkIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                                    {Math.floor((Date.now() - checkIn.timestamp) / 60000)}m ago
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {checkIn.batteryLevel !== undefined && (
                                                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded ${checkIn.batteryLevel <= 20 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                        <Activity className="w-3 h-3" />
                                                        {Math.round(checkIn.batteryLevel)}%
                                                    </div>
                                                )}

                                                {checkIn.lat && (
                                                    <button
                                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${checkIn.lat},${checkIn.lng}`, '_blank')}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                                    >
                                                        <Map className="w-3 h-3" />
                                                        View Location
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-500 italic ml-2">No history logged yet.</div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}
