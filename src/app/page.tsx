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

  // Wait for hydration
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Vault Edit State
  const [isEditingVault, setIsEditingVault] = useState(false);
  const [vaultForm, setVaultForm] = useState(identity);

  // Sync form with store when vault opens
  useEffect(() => {
    if (isVaultOpen) {
      setVaultForm(identity);
      setIsEditingVault(false);
    }
    // Only re-sync when opening, or if identity changes EXTERNALLY (like from potential sync, though we don't have that yet)
    // We intentionally omit 'identity' from deps to prevent re-renders while typing if identity were to change elsewhere?
    // Actually, 'identity' only changes on Save. 
    // But to be safe and strictly follow "Single Source of Truth", we re-initialize form on open.
  }, [isVaultOpen]); // Removed identity from deps to avoid resetting form if identity changes mid-edit (though unlikely)

  const router = useRouter();


  // Sync Location to Store
  useEffect(() => {
    if (location.lat && location.lng) {
      setLastKnownLocation({ lat: location.lat, lng: location.lng });
    }
  }, [location, setLastKnownLocation]);

  // Listen for cross-tab updates (Storage Event)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lifeline-v3' && e.newValue) {
        const check = JSON.parse(e.newValue);
        // If state.nudgeActive is true in another tab, update here
        if (check.state?.nudgeActive) {
          useLifelineStore.setState({ nudgeActive: true });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle Nudge Effect
  useEffect(() => {
    if (nudgeActive) {
      // Play Audio Cue (Beep)
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch alert
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    }
  }, [nudgeActive]);

  // Check for timer expiry
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

  // Helper to ensure battery data is sent with every check-in
  const performCheckIn = async () => {
    let batteryInfo = undefined;

    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      try {
        const battery = await (navigator as any).getBattery();
        batteryInfo = {
          level: battery.level * 100,
          isCharging: battery.charging
        };
      } catch (e) {
        console.error("Battery fetch failed", e);
      }
    }

    resetTimer(batteryInfo);

    // If this was a nudge, acknowledge it
    if (nudgeActive) {
      if (location.lat && location.lng) {
        useLifelineStore.getState().setLastNudgeLocation({ lat: location.lat, lng: location.lng });
      }
      useLifelineStore.getState().setLastNudgeAckTime(Date.now());
      useLifelineStore.getState().setNudgeActive(false);
      useLifelineStore.getState().setNudgeAcknowledged(true);
    }

    // Push state to cloud (Mark-side)
    SafetyCircleService.pushToCloud({
      lastCheckIn: Date.now(),
      batteryLevel: batteryInfo?.level || level,
      isCharging: batteryInfo?.isCharging,
      location: location,
      note: useLifelineStore.getState().currentNote, // Access current note directly from store state
      emergencyTriggered: false,
      nudgeAcknowledged: true // Explicitly send this for immediate feedback
    });
  };

  const handleAgree = () => {
    acceptDisclaimer();
    performCheckIn(); // Send battery data on initial agree
  };

  const handleBatterySim = () => {
    simulateLowBattery();
    setTimeout(() => {
      router.push("/emergency-portal");
    }, 2000);
  };

  // HARD GATE LOGIC
  if (!hasHydrated) return <div className='bg-slate-950 h-screen' />; // Silent loading
  if (!hasAcceptedDisclaimer) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-8 max-w-lg w-full shadow-2xl shadow-emerald-900/50">
          <div className="mb-6 flex justify-center">
            <div className="bg-emerald-500/20 p-4 rounded-full">
              <ShieldCheck className="w-12 h-12 text-emerald-500" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tight">SAFETY CONTRACT</h1>
          <p className="text-center text-slate-400 mb-8 text-sm">Please commit to the following safety protocols.</p>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="bg-emerald-500/10 h-8 w-8 rounded-full flex items-center justify-center text-emerald-500 font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-white">Active Monitoring</h3>
                <p className="text-slate-400 text-sm">I commit to resetting my 72-hour lifeline regularly to confirm I am safe.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-emerald-500/10 h-8 w-8 rounded-full flex items-center justify-center text-emerald-500 font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-white">Data Sharing</h3>
                <p className="text-slate-400 text-sm">I authorize location and device health sharing for my safety.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-emerald-500/10 h-8 w-8 rounded-full flex items-center justify-center text-emerald-500 font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-white">Physical Backup</h3>
                <p className="text-slate-400 text-sm">I carry my physical backup card at all times.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAgree}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            I UNDERSTAND & AGREE
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-500/30 overflow-x-hidden relative">

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-50 -z-10" />

      {/* EMERGENCY OVERLAY */}
      <AnimatePresence>
        {emergencyTriggered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-8 text-center"
          >
            <AlertTriangle className="w-24 h-24 mb-6 animate-pulse text-white" />
            <h1 className="text-4xl font-black mb-4 text-white">EMERGENCY TRIGGERED</h1>
            <p className="text-xl mb-8 text-white/90">Data sent to Safety Circle.</p>
            <div className="text-sm text-white/75 bg-red-700/50 p-4 rounded-lg">
              <p>Location: {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}</p>
              <p>Battery: {level}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NUDGE ALERT MODAL */}
      <AnimatePresence>
        {nudgeActive && !emergencyTriggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-red-600 border-4 border-white rounded-3xl p-10 max-w-xl w-full text-center shadow-[0_0_100px_rgba(220,38,38,0.8)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-white/20 animate-pulse" />

              <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Smartphone className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight leading-none">🚨 CHECK-IN REQUESTED!</h2>
              <p className="text-red-100 text-xl font-bold mb-10">Mark is requesting a status update.</p>

              <button
                onClick={performCheckIn}
                className="w-full bg-white hover:bg-slate-100 text-red-600 font-black py-6 rounded-2xl text-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl"
              >
                <ShieldCheck className="w-8 h-8" />
                I&apos;M SAFE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HELP MODAL */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setHelpOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black mb-6 text-center">HOW TO STAY SAFE</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🕒</div>
                  <div>
                    <h3 className="font-bold text-lg">Reset the Timer</h3>
                    <p className="text-slate-600 leading-tight">Push the big button every day to tell us you are okay.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">📝</div>
                  <div>
                    <h3 className="font-bold text-lg">Leave a Note</h3>
                    <p className="text-slate-600 leading-tight">Tell us where you are going or who you are with.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔋</div>
                  <div>
                    <h3 className="font-bold text-lg">Keep Charged</h3>
                    <p className="text-slate-600 leading-tight">We watch your battery. If it dies, we send your last location.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setHelpOpen(false)}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                GOT IT!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IDENTITY VAULT MODAL */}
      <AnimatePresence>
        {isVaultOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* ID CARD CONTAINER */}
            <div className="bg-white text-slate-900 rounded-xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col">

              {/* HEADER BAR */}
              <div className="bg-red-600 p-4 text-center">
                <h2 className="text-white font-black text-lg leading-tight tracking-tight uppercase">
                  ATENCIÓN: Identificación de emergencia
                </h2>
                <p className="text-white/80 text-xs font-bold uppercase">
                  ATENCIÓ: Identificació d&apos;emergència
                </p>
              </div>

              {/* CARD CONTENT */}
              <div className="p-6 md:p-8 space-y-6 relative">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {!isEditingVault ? (
                    <button
                      onClick={() => setIsEditingVault(true)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded-full transition-colors"
                    >
                      EDIT
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveVault}
                      className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-full transition-colors"
                    >
                      SAVE
                    </button>
                  )}
                  <button
                    onClick={() => setVaultOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
                  {/* PHOTO */}
                  <div className="w-24 h-24 bg-slate-200 rounded-full shrink-0 border-4 border-slate-100 shadow-inner flex items-center justify-center mx-auto md:mx-0">
                    <Smartphone className="w-10 h-10 text-slate-300" />
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-4 w-full text-left">

                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Name / Nombre / Nom</p>
                      {isEditingVault ? (
                        <input
                          type="text"
                          value={vaultForm.fullName}
                          onChange={(e) => setVaultForm({ ...vaultForm, fullName: e.target.value })}
                          className="w-full font-black text-slate-900 text-xl border-b-2 border-slate-200 focus:border-slate-900 outline-none bg-transparent"
                        />
                      ) : (
                        <p className="text-xl font-black text-slate-900">{identity.fullName}</p>
                      )}
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">DOB / Fecha de Nac. / Data Naix.</p>
                      {isEditingVault ? (
                        <input
                          type="text"
                          value={vaultForm.dob}
                          onChange={(e) => setVaultForm({ ...vaultForm, dob: e.target.value })}
                          className="w-full font-bold text-slate-800 text-lg border-b-2 border-slate-200 focus:border-slate-900 outline-none bg-transparent"
                        />
                      ) : (
                        <p className="text-lg font-bold text-slate-800">{identity.dob} <span className="text-slate-400 font-normal text-sm ml-2">(Age 18)</span></p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Blood / Sangre / Sang</p>
                        {isEditingVault ? (
                          <input
                            type="text"
                            value={vaultForm.bloodType}
                            onChange={(e) => setVaultForm({ ...vaultForm, bloodType: e.target.value })}
                            className="w-full font-bold text-red-600 text-lg border-b-2 border-red-200 focus:border-red-600 outline-none bg-transparent"
                          />
                        ) : (
                          <p className="text-lg font-bold text-red-600">{identity.bloodType}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passport / Pasaporte / Passaport</p>
                        {isEditingVault ? (
                          <input
                            type="text"
                            value={vaultForm.passport}
                            onChange={(e) => setVaultForm({ ...vaultForm, passport: e.target.value })}
                            className="w-full font-bold text-slate-800 text-lg border-b-2 border-slate-200 focus:border-slate-900 outline-none bg-transparent font-mono"
                          />
                        ) : (
                          <p className="text-lg font-bold text-slate-800 font-mono">{identity.passport}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 max-h-[150px] overflow-y-auto">
                      <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Medical Alert / Alerta Médica / Alerta Mèdica</p>
                      {isEditingVault ? (
                        <textarea
                          value={vaultForm.medical}
                          onChange={(e) => setVaultForm({ ...vaultForm, medical: e.target.value })}
                          className="w-full font-bold text-red-700 bg-transparent border-b-2 border-red-200 focus:border-red-600 outline-none resize-none h-20"
                        />
                      ) : (
                        <p className="font-bold text-red-700">{identity.medical}</p>
                      )}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Emergency Contact / Contacto / Contacte</p>
                      {isEditingVault ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={vaultForm.contactName}
                            onChange={(e) => setVaultForm({ ...vaultForm, contactName: e.target.value })}
                            className="w-full font-black text-slate-900 text-lg border-b-2 border-slate-200 focus:border-slate-900 outline-none bg-transparent"
                          />
                          <input
                            type="text"
                            placeholder="Phone"
                            value={vaultForm.contactPhone}
                            onChange={(e) => setVaultForm({ ...vaultForm, contactPhone: e.target.value })}
                            className="w-full text-slate-600 font-mono font-bold tracking-wide border-b-2 border-slate-200 focus:border-slate-900 outline-none bg-transparent"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-black text-slate-900 text-lg">{identity.contactName}</p>
                          <p className="text-slate-600 font-mono font-bold tracking-wide">{identity.contactPhone}</p>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* FOOTER ACTION */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-center">
                <button
                  onClick={() => setVaultOpen(false)}
                  className="text-slate-500 font-bold text-sm hover:text-slate-800 underline decoration-slate-300 underline-offset-4 transition-colors"
                >
                  Close Secure Vault
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 min-h-screen relative">

        {/* HELP BUTTON */}
        <button
          onClick={() => setHelpOpen(true)}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-20 text-slate-500 hover:text-white transition-colors"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        {/* LEFT COLUMN (Contacts & Utils) */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
          <ContactsSidebar />

          {/* Secondary Actions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <Link href="/log-face" className="w-full bg-slate-800 border border-slate-700 text-white h-12 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer">
              <Camera className="w-5 h-5" />
              Log Face Evidence
            </Link>
            <button
              onClick={() => setVaultOpen(true)}
              className="w-full bg-slate-800 border border-slate-700 text-white h-12 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              Open Secure Vault
            </button>
          </div>

          <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
            <button
              onClick={handleBatterySim}
              className="w-full text-red-400 text-xs font-bold uppercase tracking-widest hover:text-red-300 transition-colors flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Simulate Low Battery
            </button>
          </div>
        </aside>

        {/* MAIN CENTER (Safety Ring) */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] order-1 lg:order-2">
          <div className="w-full flex justify-between items-center mb-8 px-4 opacity-50">
            <div className="flex flex-col text-xs text-slate-400">
              <span className="font-bold">SYSTEM STATUS:</span>
              <span>{isTimerRunning ? "MONITORING" : "PAUSED"}</span>
            </div>
            <div className="flex flex-col text-xs text-right text-slate-400">
              <span className="font-bold">BATTERY:</span>
              <span>{level !== null ? `${level}%` : "--"}</span>
            </div>
          </div>

          <SafetyCountdown
            timer={timer}
            initialTime={initialTime}
            onReset={resetTimer}
            isTimerRunning={isTimerRunning}
          />
        </div>

        {/* RIGHT COLUMN (Placeholder/Balance - Optional, kept empty or for future expansion) */}
        <div className="hidden lg:block w-20 2xl:w-60 order-3">
          {/* Future Widgets */}
        </div>

      </div>

      {/* Battery Sentinel Warning */}
      <AnimatePresence>
        {isLowPower && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-orange-600 p-4 text-white font-bold text-center flex items-center justify-center gap-2 z-40 shadow-lg shadow-orange-900/50"
          >
            <Smartphone className="w-5 h-5" />
            LOW BATTERY DETECTED - AUTO-PINGING LOCATION
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEBUG: RESET APP */}
      <div className="flex justify-center pb-8 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="text-red-500 text-xs font-bold uppercase tracking-widest border border-red-900 p-2 rounded"
        >
          RESET APP (DEBUG)
        </button>
      </div>

    </main>
  );
}
