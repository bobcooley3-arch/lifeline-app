export const SafetyCircleService = {
    pushToCloud: async (data: any) => {
        try {
            console.log("☁️ Syncing to Lifeline Cloud...");
            const response = await fetch('/api/pulse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error("❌ Sync Failed:", error);
        }
    },

    triggerEmergency: async (lat: number | null, lng: number | null, battery: number | null) => {
        return SafetyCircleService.pushToCloud({
            emergencyTriggered: true,
            location: { lat, lng },
            batteryLevel: battery,
            lastCheckIn: Date.now()
        });
    }
};
