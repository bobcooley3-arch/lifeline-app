import { useLifelineStore } from "@/store/useLifelineStore";

export const SafetyCircleService = {
    triggerEmergency: async (lat: number | null, lng: number | null, batteryLevel: number | null) => {
        console.log("--- SAFETY CIRCLE ACTIVATED ---");
        console.log("Transmitting compiled data package...");

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`LOCATION LOGGED: [${lat ?? 'UNKNOWN'}, ${lng ?? 'UNKNOWN'}]`);
        console.log(`BATTERY STATUS: ${batteryLevel ?? 'UNKNOWN'}%`);
        console.log("VAULT CONTENTS: [Passport.pdf, Insurance.pdf] -> SENT (Encrypted)");
        console.log("STATUS: EMERGENCY PROTOCOL EXECUTED.");
        console.log("-------------------------------");

        // Try to push emergency state to cloud as well
        await SafetyCircleService.pushToCloud({
            emergencyTriggered: true,
            lastKnownLocation: { lat: lat || 0, lng: lng || 0 },
            batteryLevel: batteryLevel,
            timestamp: Date.now()
        });

        return true;
    },

    pushToCloud: async (data: any, retryCount = 0) => {
        const MAX_RETRIES = 5;
        const RETRY_DELAY = 5000;
        const { setIsSyncing } = useLifelineStore.getState();

        try {
            if (retryCount === 0) setIsSyncing(true);
            console.log(`☁️ Pushing to /api/pulse... ${retryCount > 0 ? `[Attempt ${retryCount + 1}]` : ''}`);

            await fetch('/api/pulse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            console.log("✅ Sync Successful");
            setIsSyncing(false);
        } catch (error) {
            console.warn(`⚠️ Cloud Sync Failed (Offline Mode) - Attempt ${retryCount + 1}/${MAX_RETRIES}`, error);

            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying cloud sync... [Attempt ${retryCount + 1}]`);
                setTimeout(() => SafetyCircleService.pushToCloud(data, retryCount + 1), RETRY_DELAY);
            } else {
                console.error("❌ Max retries reached. Sync aborted.");
                setIsSyncing(false);
            }
        }
    },

    fetchPulse: async () => {
        try {
            const res = await fetch('/api/pulse');
            if (!res.ok) throw new Error("Network response was not ok");
            return await res.json();
        } catch (error) {
            console.warn("⚠️ Fetch Pulse Failed", error);
            return null;
        }
    }
};
