import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';
import { useTrackerStore } from '../../store/useTrackerStore';
import { TrackingCard } from './TrackingCard';

export const NursingTracker: React.FC = () => {
    const { startTimer, stopTimer, addLog, activeTimers } = useTrackerStore();

    // Timers for Left and Right
    const leftTimer = activeTimers['nursing-left'];
    const rightTimer = activeTimers['nursing-right'];

    const [leftElapsed, setLeftElapsed] = useState(0);
    const [rightElapsed, setRightElapsed] = useState(0);
    const [leftAccumulated, setLeftAccumulated] = useState(0);
    const [rightAccumulated, setRightAccumulated] = useState(0);
    const [leftStoppedDuration, setLeftStoppedDuration] = useState<number | null>(null);
    const [rightStoppedDuration, setRightStoppedDuration] = useState<number | null>(null);
    const [lastStoppedSide, setLastStoppedSide] = useState<'left' | 'right' | null>(null);

    useEffect(() => {
        const updateTime = () => {
            if (leftTimer) {
                setLeftElapsed(leftAccumulated + Math.floor((Date.now() - leftTimer.startTime) / 1000));
            } else {
                setLeftElapsed(leftAccumulated);
            }
            if (rightTimer) {
                setRightElapsed(rightAccumulated + Math.floor((Date.now() - rightTimer.startTime) / 1000));
            } else {
                setRightElapsed(rightAccumulated);
            }
        };

        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [leftTimer, rightTimer, leftAccumulated, rightAccumulated]);

    const toggleSide = (side: 'left' | 'right') => {
        const isActive = side === 'left' ? !!leftTimer : !!rightTimer;

        if (isActive) {
            const duration = stopTimer('nursing', side);
            if (side === 'left') {
                const total = leftAccumulated + duration;
                setLeftAccumulated(total);
                setLeftStoppedDuration(duration);
                setLeftElapsed(total);
            } else {
                const total = rightAccumulated + duration;
                setRightAccumulated(total);
                setRightStoppedDuration(duration);
                setRightElapsed(total);
            }
            setLastStoppedSide(side);
        } else {
            if (side === 'left') {
                setLeftStoppedDuration(null);
            } else {
                setRightStoppedDuration(null);
            }
            setLastStoppedSide(null);
            startTimer('nursing', side);
        }
    };

    const handleSave = () => {
        if (!lastStoppedSide) return;
        const duration = lastStoppedSide === 'left' ? leftStoppedDuration : rightStoppedDuration;
        if (duration === null) return;
        addLog({
            type: 'nursing',
            timestamp: new Date().toISOString(),
            duration,
            details: { side: lastStoppedSide },
        });
        if (lastStoppedSide === 'left') {
            setLeftStoppedDuration(null);
            setLeftElapsed(0);
            setLeftAccumulated(0);
        } else {
            setRightStoppedDuration(null);
            setRightElapsed(0);
            setRightAccumulated(0);
        }
        setLastStoppedSide(null);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <TrackingCard title="Nursing">
            <Text variant="titleLarge" style={styles.combinedTime}>
                {formatTime(leftElapsed + rightElapsed)}
            </Text>
            <View style={styles.row}>
                <View style={styles.sideContainer}>
                    <Pressable
                        onPress={() => toggleSide('left')}
                        style={({ pressed }) => [
                            styles.circleButton,
                            leftTimer ? styles.circleButtonActive : styles.circleButtonInactive,
                            pressed && styles.circleButtonPressed,
                        ]}
                    >
                        <Text
                            variant="labelLarge"
                            style={[styles.circleLabel, leftTimer ? styles.circleLabelActive : styles.circleLabelInactive]}
                        >
                            Left
                        </Text>
                        <Text
                            variant="titleLarge"
                            style={[styles.circleTimer, leftTimer ? styles.circleTimerActive : styles.circleTimerInactive]}
                        >
                            {formatTime(leftElapsed)}
                        </Text>
                        <Icon
                            source={leftTimer ? 'pause' : 'play'}
                            size={20}
                            color={leftTimer ? '#FFFFFF' : '#F59E0B'}
                        />
                    </Pressable>
                </View>

                <View style={styles.sideContainer}>
                    <Pressable
                        onPress={() => toggleSide('right')}
                        style={({ pressed }) => [
                            styles.circleButton,
                            rightTimer ? styles.circleButtonActive : styles.circleButtonInactive,
                            pressed && styles.circleButtonPressed,
                        ]}
                    >
                        <Text
                            variant="labelLarge"
                            style={[styles.circleLabel, rightTimer ? styles.circleLabelActive : styles.circleLabelInactive]}
                        >
                            Right
                        </Text>
                        <Text
                            variant="titleLarge"
                            style={[styles.circleTimer, rightTimer ? styles.circleTimerActive : styles.circleTimerInactive]}
                        >
                            {formatTime(rightElapsed)}
                        </Text>
                        <Icon
                            source={rightTimer ? 'pause' : 'play'}
                            size={20}
                            color={rightTimer ? '#FFFFFF' : '#F59E0B'}
                        />
                    </Pressable>
                </View>
            </View>
            {lastStoppedSide && (
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    buttonColor="#F59E0B"
                    textColor="#FFFFFF"
                    contentStyle={{ height: 44 }}
                >
                    Save
                </Button>
            )}
        </TrackingCard>
    );
};

const styles = StyleSheet.create({
    combinedTime: {
        textAlign: 'center',
        marginBottom: 8,
        fontVariant: ['tabular-nums'],
    },
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
    circleButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    circleButtonActive: {
        backgroundColor: '#F59E0B',
    },
    circleButtonInactive: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#F59E0B',
    },
    circleButtonPressed: {
        opacity: 0.85,
    },
    circleLabel: {
        color: '#FFFFFF',
    },
    circleTimer: {
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    circleLabelActive: {
        color: '#FFFFFF',
    },
    circleLabelInactive: {
        color: '#F59E0B',
    },
    circleTimerActive: {
        color: '#FFFFFF',
    },
    circleTimerInactive: {
        color: '#F59E0B',
    },
    saveButton: {
        marginTop: 12,
        alignSelf: 'stretch',
        borderRadius: 8,
        marginHorizontal: 8,
    },
});
