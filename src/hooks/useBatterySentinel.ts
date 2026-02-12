import { useState, useEffect } from 'react';
import { useLifelineStore } from '@/store/useLifelineStore';

export interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

type NavigatorWithBattery = Navigator & {
    getBattery: () => Promise<BatteryManager>;
};

export const useBatterySentinel = () => {
    const { setBatteryLevel } = useLifelineStore();
    const [level, setLevel] = useState<number | null>(null);
    const [isLowPower, setIsLowPower] = useState(false);

    useEffect(() => {
        const nav = navigator as NavigatorWithBattery;
        if (!nav.getBattery) return;

        nav.getBattery().then((battery) => {
            const updateBattery = () => {
                const lvl = battery.level * 100;
                setLevel(lvl);
                setBatteryLevel(lvl);
                setIsLowPower(lvl <= 5);

                if (lvl <= 5) {
                    console.log("BATTERY SENTINEL TRIGGERED: Level at " + lvl + "%");
                    // Here we would trigger the 'ping'
                }
            };

            updateBattery();
            battery.addEventListener('levelchange', updateBattery);

            return () => {
                battery.removeEventListener('levelchange', updateBattery);
            };
        });
    }, [setBatteryLevel]);

    // Debug function to simulate low battery
    const simulateLowBattery = () => {
        setLevel(5);
        setBatteryLevel(5);
        setIsLowPower(true);
        console.log("DEBUG: BATTERY SENTINEL TRIGGERED (SIMULATED): Level at 5%");
    };

    return { level, isLowPower, simulateLowBattery };
};
