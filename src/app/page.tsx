"use client";

import { useEffect, useState } from "react";
import { useLifelineStore } from "@/store/useLifelineStore";
import { useDeadMansSwitch } from "@/hooks/useDeadMansSwitch";
import { useBatterySentinel } from "@/hooks/useBatterySentinel";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { SafetyCircleService } from "@/services/SafetyCircleService";
import { Smartphone, AlertTriangle, Camera, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { SafetyCountdown } from "@/components/SafetyCountdown";
import { ContactsSidebar } from "@/components/ContactsSidebar";

export default function Dashboard() {
  const { timer, initialTime, resetTimer, setLastKnownLocation, nudgeActive, setNudgeActive, hasAcceptedDisclaimer, acceptDisclaimer, isVaultOpen, setVaultOpen, identity, updateIdentity } = useLifelineStore();
  const { isTimerRunning } = useDeadMansSwitch();
  const { level, isLowPower, simulateLowBattery } = useBatterySentinel();
  const location = useGeoLocation();
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const [isEditingVault, setIsEditingVault] = useState(false);
  const [vaultForm, setVaultForm] = useState(identity);

  useEffect(() => {
    if (isVaultOpen) {
      setVaultForm(identity);
      setIsEditingVault(false);
    }
  }, [isVaultOpen]);

  const router = useRouter();

  useEffect(() => {
    if (location.lat && location.lng) {
      setLastKnownLocation({ lat: location.lat, lng: location.lng });
    }
  }, [location, setLastKnownLocation]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lifeline-v3' && e.newValue) {
        const check = JSON.parse(e.newValue);
        if (check.state?.nudgeActive) {
          useLifelineStore.setState({ nudgeActive: true });
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (nudgeActive) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    }
  }, [nudgeActive]);

  useEffect(() => {
    if (timer === 0 && !emergencyTriggered) {
      setEmergencyTriggered(true);
      SafetyCircleService.triggerEmergency(location.lat, location.lng, level);
      setTimeout(() => {
        router.push("/emergency-portal");
      }, 2000);
    }
  }, [timer, emergencyTriggered, location, level, router]);

  const handleSaveVault = () => {
    updateIdentity(vaultForm);
    setIsEditingVault(false);
  };

  const performCheckIn = async () => {
    let batteryInfo = undefined;
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      try {
        const battery = await (navigator as any).getBattery();
        batteryInfo = { level: battery.level * 100, isCharging: battery.charging };
      } catch (e) { console.error("Battery fetch failed", e); }
    }

    resetTimer(batteryInfo);

    if (nudgeActive) {
      if (location.lat && location.lng) {
        useLifelineStore.getState().setLastNudgeLocation({ lat: location.lat, lng: location.lng });
      }
      useLifelineStore.getState().setLastNudgeAckTime(Date.now());
      useLifelineStore.getState().setNudgeActive(false);
      useLifelineStore.getState().setNudgeAcknowledged(true);
    }

    // Connect to v6 Pulse
    SafetyCircleService.pushToCloud({
      lastCheckIn: Date.now(),
      batteryLevel: batteryInfo?.level || level,
      isCharging: batteryInfo?.isCharging,
      location: location,
      emergencyTriggered: false,
      version: "v6"
    });
  };

  const handleAgree = () => {
    acceptDisclaimer();
    performCheckIn();
  };

  const handleBatterySim = () => {
    simulateLowBattery();
    setTimeout(() => { router.push("/emergency-portal"); }, 2000);
  };

  if (!hasHydrated) return <div className='bg-slate-950 h-screen' />;
  if (!hasAcceptedDisclaimer) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-8 max-w-lg w-full shadow-2xl shadow-emerald-900/50">
          <div className="mb-6 flex justify-center">
            <div className="bg-emerald-500/20 p-4 rounded-full">
              <ShieldCheck className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tight uppercase">Safety Contract (v6)</h1>
          <p className="text-center text-slate-400 mb-8 text-sm italic">Build Verified: System Operational</p>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="bg-emerald-500/10 h-8 w-8 rounded-full flex items-center justify-center text-emerald-500 font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Active Monitoring</h3>
                <p className="text-slate-400 text-sm">I commit to resetting my lifeline regularly.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-emerald-500/10 h-8 w-8 rounded-full flex items-center justify-center text-emerald-500 font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Data Sharing</h3>
                <p className="text-slate-400 text-sm">I authorize location and device health sharing.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAgree}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-lg transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 uppercase"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-500/30 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-50 -z-10" />

      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 min-h-screen relative">
        <aside className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
          <ContactsSidebar />
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Architecture: v6</p>
          </div>
        </aside>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] order-1 lg:order-2">
          <div className="w-full flex justify-between items-center mb-8 px-4 opacity-50">
            <div className="flex flex-col text-xs text-slate-400">
              <span className="font-bold uppercase tracking-tighter">Status (v6):</span>
              <span className="font-mono">{isTimerRunning ? "ACTIVE_MONITOR" : "PAUSED"}</span>
            </div>
            <div className="flex flex-col text-xs text-right text-slate-400">
              <span className="font-bold uppercase tracking-tighter">Battery:</span>
              <span className="font-mono">{level !== null ? `${level}%` : "--"}</span>
            </div>
          </div>

          <SafetyCountdown
            timer={timer}
            initialTime={initialTime}
            onReset={performCheckIn}
            isTimerRunning={isTimerRunning}
          />
        </div>
      </div>
    </main>
  );
}
