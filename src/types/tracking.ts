export type ActivityType = 'sleep' | 'nursing' | 'bottle' | 'diaper' | 'custom';

export interface LogEntry {
    id: string;
    type: ActivityType;
    timestamp: string; // ISO string
    duration?: number; // in seconds
    details?: {
        side?: 'left' | 'right'; // For nursing
        amount?: number; // For bottle
        unit?: 'oz' | 'ml'; // For bottle
        contents?: ('pee' | 'poo')[]; // For diaper
        note?: string; // For custom/others
    };
}

export interface Timer {
    startTime: number; // Unix timestamp
    type: ActivityType;
    side?: 'left' | 'right';
}
