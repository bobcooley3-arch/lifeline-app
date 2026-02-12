import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FaceLog {
    id: string;
    image: string; // base64 or url
    timestamp: number;
    lat: number | null;
    lng: number | null;
    note?: string;
}

interface LifelineState {
    timer: number;
    initialTime: number;
    isUnlocked: boolean;
    batteryLevel: number | null;
    isRunning: boolean;
    faceLogs: FaceLog[];
    lastKnownLocation: { lat: number; lng: number } | null;
    lastNudgeLocation: { lat: number; lng: number } | null;
    lastNudgeAckTime: number | null;
    userVault: { id: string; name: string; type: string; size: string; color: string }[];
    emergencyPin: string;
    nudgeActive: boolean;
    nudgeAcknowledged: boolean;
    hasAcceptedDisclaimer: boolean;
    isVaultOpen: boolean;
    isSyncing: boolean;
    currentNote: string;
    expiryTimestamp: number | null;
    identity: {
        fullName: string;
        dob: string;
        bloodType: string;
        passport: string;
        medical: string;
        contactName: string;
        contactPhone: string;
    };
    checkInHistory: {
        timestamp: number;
        note: string;
        lat: number | null;
        lng: number | null;
        batteryLevel?: number;
        isCharging?: boolean;
    }[];

    // Actions
    resetTimer: (batteryInfo?: { level: number, isCharging: boolean }) => void;
    decrementTimer: (seconds: number) => void;
    unlockVault: () => void;
    lockVault: () => void;
    setBatteryLevel: (level: number) => void;
    setIsRunning: (running: boolean) => void;
    addFaceLog: (log: FaceLog) => void;
    setLastKnownLocation: (loc: { lat: number; lng: number } | null) => void;
    setLastNudgeLocation: (loc: { lat: number; lng: number } | null) => void;
    sendNudge: () => void;
    setNudgeActive: (active: boolean) => void;
    setNudgeAcknowledged: (acknowledged: boolean) => void;
    setLastNudgeAckTime: (time: number | null) => void;
    acceptDisclaimer: () => void;
    setVaultOpen: (open: boolean) => void;
    setNote: (note: string) => void;
    updateIdentity: (data: Partial<LifelineState['identity']>) => void;
    setIsSyncing: (syncing: boolean) => void;
}

export const useLifelineStore = create<LifelineState>()(
    persist(
        (set) => ({
            timer: 72 * 60 * 60, // 72 hours in seconds
            initialTime: 72 * 60 * 60,
            isUnlocked: false,
            isVaultOpen: false,
            isSyncing: false,
            batteryLevel: null,
            isRunning: true,
            faceLogs: [],
            lastKnownLocation: null,
            lastNudgeLocation: null,
            lastNudgeAckTime: null,
            expiryTimestamp: Date.now() + (72 * 60 * 60 * 1000),
            userVault: [
                { id: "1", name: "Passport_Scan.pdf", type: "IDENTITY", size: "1.2 MB", color: "blue" },
                { id: "2", name: "Travel_Insurance_Policy.pdf", type: "MEDICAL", size: "0.8 MB", color: "purple" },
                { id: "3", name: "Embassy_Contact_Card.vcf", type: "CONTACT", size: "0.1 MB", color: "green" },
            ],
            emergencyPin: "1234",
            nudgeActive: false,
            nudgeAcknowledged: false,
            hasAcceptedDisclaimer: false,
            currentNote: "",
            identity: {
                fullName: "Sarah Connor",
                dob: "11/11/2007",
                bloodType: "B+",
                passport: "#123456789",
                medical: "Penicillin Allergy / Alergia a la Penicilina",
                contactName: "Mark (Dad)",
                contactPhone: "+1 (555) 0199-283"
            },
            checkInHistory: [],

            resetTimer: (batteryInfo) => set((state) => {
                const newCheckIn = {
                    timestamp: Date.now(),
                    note: state.currentNote,
                    lat: state.lastKnownLocation?.lat || null,
                    lng: state.lastKnownLocation?.lng || null,
                    batteryLevel: batteryInfo?.level,
                    isCharging: batteryInfo?.isCharging
                };

                return {
                    timer: state.initialTime,
                    expiryTimestamp: Date.now() + (state.initialTime * 1000),
                    isRunning: true,
                    nudgeActive: false,
                    nudgeAcknowledged: false, // Reset acknowledgment on new check-in
                    checkInHistory: [newCheckIn, ...state.checkInHistory].slice(0, 5),
                    currentNote: ""
                };
            }),
            decrementTimer: (seconds) => set((state) => ({ timer: Math.max(0, state.timer - seconds) })),
            unlockVault: () => set({ isUnlocked: true }),
            lockVault: () => set({ isUnlocked: false }),
            setBatteryLevel: (level) => set({ batteryLevel: level }),
            setIsRunning: (running) => set({ isRunning: running }),
            addFaceLog: (log) => set((state) => ({ faceLogs: [log, ...state.faceLogs] })),
            setLastKnownLocation: (loc) => set({ lastKnownLocation: loc }),
            setLastNudgeLocation: (loc) => set({ lastNudgeLocation: loc }),
            sendNudge: () => set({ nudgeActive: true, nudgeAcknowledged: false, lastNudgeLocation: null, lastNudgeAckTime: null }), // Clear old data
            setNudgeActive: (active) => set({ nudgeActive: active }),
            setNudgeAcknowledged: (acknowledged) => set({ nudgeAcknowledged: acknowledged }),
            setLastNudgeAckTime: (time) => set({ lastNudgeAckTime: time }),
            acceptDisclaimer: () => set({ hasAcceptedDisclaimer: true }),
            setVaultOpen: (open) => set({ isVaultOpen: open }),
            setNote: (note) => set({ currentNote: note }),
            updateIdentity: (data) => set((state) => ({ identity: { ...state.identity, ...data } })),
            setIsSyncing: (syncing) => set({ isSyncing: syncing }),
        }),
        {
            name: 'lifeline-v3', // Force reset for Safety Contract fix V3
            partialize: (state) => ({
                timer: state.timer,
                initialTime: state.initialTime,
                isUnlocked: state.isUnlocked,
                faceLogs: state.faceLogs,
                lastKnownLocation: state.lastKnownLocation,
                lastNudgeLocation: state.lastNudgeLocation,
                lastNudgeAckTime: state.lastNudgeAckTime,
                nudgeActive: state.nudgeActive,
                nudgeAcknowledged: state.nudgeAcknowledged,
                hasAcceptedDisclaimer: state.hasAcceptedDisclaimer,
                isVaultOpen: state.isVaultOpen,
                checkInHistory: state.checkInHistory,
                identity: state.identity,
                expiryTimestamp: state.expiryTimestamp
            }),
            version: 6, // Bump version for migration
        }
    )
);
