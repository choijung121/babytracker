import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTrackerStore } from '../../store/useTrackerStore';
import { TrackingCard } from './TrackingCard';

export const NursingTracker: React.FC = () => {
    const { startTimer, stopTimer, addLog, activeTimers } = useTrackerStore();

    // Timers for Left and Right
    const leftTimer = activeTimers['nursing-left'];
    const rightTimer = activeTimers['nursing-right'];

    const [leftElapsed, setLeftElapsed] = useState(0);
    const [rightElapsed, setRightElapsed] = useState(0);

    useEffect(() => {
        const updateTime = () => {
            if (leftTimer) setLeftElapsed(Math.floor((Date.now() - leftTimer.startTime) / 1000));
            if (rightTimer) setRightElapsed(Math.floor((Date.now() - rightTimer.startTime) / 1000));
        };

        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [leftTimer, rightTimer]);

    const toggleSide = (side: 'left' | 'right') => {
        const isActive = side === 'left' ? !!leftTimer : !!rightTimer;

        if (isActive) {
            const duration = stopTimer('nursing', side);
            addLog({
                type: 'nursing',
                timestamp: new Date().toISOString(),
                duration,
                details: { side },
            });
            if (side === 'left') setLeftElapsed(0);
            else setRightElapsed(0);
        } else {
            startTimer('nursing', side);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <TrackingCard title="Nursing">
            <View style={styles.row}>
                <View style={styles.sideContainer}>
                    <Text variant="labelLarge" style={styles.label}>Left</Text>
                    <Text variant="titleLarge" style={styles.timer}>{formatTime(leftElapsed)}</Text>
                    <Button
                        mode={leftTimer ? "contained" : "outlined"}
                        onPress={() => toggleSide('left')}
                        compact
                        style={styles.button}
                    >
                        {leftTimer ? "Stop" : "Start"}
                    </Button>
                </View>

                <View style={styles.sideContainer}>
                    <Text variant="labelLarge" style={styles.label}>Right</Text>
                    <Text variant="titleLarge" style={styles.timer}>{formatTime(rightElapsed)}</Text>
                    <Button
                        mode={rightTimer ? "contained" : "outlined"}
                        onPress={() => toggleSide('right')}
                        compact
                        style={styles.button}
                    >
                        {rightTimer ? "Stop" : "Start"}
                    </Button>
                </View>
            </View>
        </TrackingCard>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    sideContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    label: {
        marginBottom: 4,
    },
    timer: {
        marginBottom: 8,
        fontVariant: ['tabular-nums'],
    },
    button: {
        width: '100%',
    },
});
