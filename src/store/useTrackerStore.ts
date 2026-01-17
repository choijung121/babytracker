import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ActivityType, LogEntry, Timer } from '../types/tracking';

interface TrackerState {
    logs: LogEntry[];
    activeTimers: Record<string, Timer>; // Keyed by type or type-side
    addLog: (entry: Omit<LogEntry, 'id'>) => void;
    removeLog: (id: string) => void;
    startTimer: (type: ActivityType, side?: 'left' | 'right') => void;
    stopTimer: (type: ActivityType, side?: 'left' | 'right') => number; // Returns duration in seconds
    resetTimers: () => void;
}

export const useTrackerStore = create<TrackerState>()(
    persist(
        (set, get) => ({
            logs: [],
            activeTimers: {},

            addLog: (entry) => {
                console.log('Adding log:', entry);
                const id = Math.random().toString(36).substring(7);
                set((state) => ({
                    logs: [{ ...entry, id }, ...state.logs].sort(
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    ),
                }));
            },

            removeLog: (id) => {
                console.log('Removing log:', id);
                set((state) => ({
                    logs: state.logs.filter((log) => log.id !== id),
                }));
            },

            startTimer: (type, side) => {
                console.log('Starting timer:', type, side);
                const key = side ? `${type}-${side}` : type;
                set((state) => ({
                    activeTimers: {
                        ...state.activeTimers,
                        [key]: { startTime: Date.now(), type, side },
                    },
                }));
            },

            stopTimer: (type, side) => {
                console.log('Stopping timer:', type, side);
                const key = side ? `${type}-${side}` : type;
                const timer = get().activeTimers[key];

                if (!timer) return 0;

                const duration = Math.floor((Date.now() - timer.startTime) / 1000);

                // Remove the timer
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [key]: _, ...remainingTimers } = get().activeTimers;
                set({ activeTimers: remainingTimers });

                return duration;
            },

            resetTimers: () => set({ activeTimers: {} }),
        }),
        {
            name: 'tracker-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
