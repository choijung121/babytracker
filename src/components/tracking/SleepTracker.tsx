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
    const [stoppedDuration, setStoppedDuration] = useState<number | null>(null);

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
            setStoppedDuration(duration);
            setElapsed(Math.floor(duration));
        } else {
            setElapsed(0);
            setStoppedDuration(null);
            startTimer('sleep');
        }
    };

    const handleSave = () => {
        if (stoppedDuration === null) return;
        addLog({
            type: 'sleep',
            timestamp: new Date().toISOString(),
            duration: stoppedDuration,
        });
        setStoppedDuration(null);
        setElapsed(0);
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
                {!isSleeping && stoppedDuration !== null && (
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        style={[styles.button, styles.saveButton]}
                        buttonColor="#F59E0B"
                        textColor="#FFFFFF"
                        contentStyle={{ height: 48 }}
                    >
                        Save
                    </Button>
                )}
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
    saveButton: {
        marginTop: 12,
    },
});
