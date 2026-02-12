import { useEffect } from 'react';
import { useLifelineStore } from '@/store/useLifelineStore';

export const useDeadMansSwitch = () => {
    const { timer, isRunning, decrementTimer, setIsRunning } = useLifelineStore();

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timer > 0) {
            interval = setInterval(() => {
                decrementTimer(1);
            }, 1000);
        } else if (timer === 0 && isRunning) {
            // Timer expired logic will be handled here or in the component listening to the timer
            setIsRunning(false);
        }

        return () => clearInterval(interval);
    }, [isRunning, timer, decrementTimer, setIsRunning]);

    return { timer, isTimerRunning: isRunning };
};
