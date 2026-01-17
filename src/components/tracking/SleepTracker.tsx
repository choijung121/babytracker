import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useTrackerStore } from '../../store/useTrackerStore';
import { TrackingCard } from './TrackingCard';

export const SleepTracker: React.FC = () => {
    const { startTimer, stopTimer, addLog, activeTimers } = useTrackerStore();
    const theme = useTheme();

    const isSleeping = !!activeTimers['sleep'];
    const startTime = activeTimers['sleep']?.startTime;

    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isSleeping && startTime) {
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSleeping, startTime]);

    const handleToggle = () => {
        if (isSleeping) {
            const duration = stopTimer('sleep');
            addLog({
                type: 'sleep',
                timestamp: new Date().toISOString(),
                duration: duration,
            });
        } else {
            setElapsed(0);
            startTimer('sleep');
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <TrackingCard title="Sleep">
            <View style={styles.container}>
                <Text variant="displayMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
                    {formatTime(elapsed)}
                </Text>
                <Button
                    mode="contained"
                    onPress={handleToggle}
                    style={styles.button}
                    buttonColor={isSleeping ? theme.colors.error : theme.colors.primary}
                    contentStyle={{ height: 48 }} // Large touch target
                >
                    {isSleeping ? 'Stop' : 'Start'}
                </Button>
            </View>
        </TrackingCard>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    button: {
        borderRadius: 8,
    },
});
