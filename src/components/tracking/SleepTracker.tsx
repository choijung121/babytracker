import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useTrackerStore } from '../../store/useTrackerStore';
import { SaveButton } from './SaveButton';
import { TrackingCard } from './TrackingCard';

export const SleepTracker: React.FC = () => {
    const { startTimer, stopTimer, addLog, activeTimers } = useTrackerStore();
    const theme = useTheme();

    const isSleeping = !!activeTimers['sleep'];
    const startTime = activeTimers['sleep']?.startTime;

    const [elapsed, setElapsed] = useState(0);
    const [stoppedDuration, setStoppedDuration] = useState<number | null>(null);
    const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
    const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
    const [startTimeLabel, setStartTimeLabel] = useState('');
    const [endTimeLabel, setEndTimeLabel] = useState('');
    const [note, setNote] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');
    const [pickerHour, setPickerHour] = useState(7);
    const [pickerMinute, setPickerMinute] = useState(0);
    const [pickerMeridiem, setPickerMeridiem] = useState<'AM' | 'PM'>('AM');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        const effectiveStart = startTimestamp ?? startTime;
        if (isSleeping && effectiveStart) {
            if (!startTimestamp) {
                setStartTimestamp(effectiveStart);
                setStartTimeLabel(format(new Date(effectiveStart), 'h:mma'));
            }
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - effectiveStart) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSleeping, startTime, startTimestamp]);

    const handleToggle = () => {
        if (isSleeping) {
            stopTimer('sleep');
            const effectiveStart = startTimestamp ?? startTime ?? Date.now();
            const duration = Math.floor((Date.now() - effectiveStart) / 1000);
            const now = Date.now();
            setStoppedDuration(duration);
            setElapsed(Math.floor(duration));
            setEndTimestamp(now);
            setEndTimeLabel(format(new Date(now), 'h:mma'));
            if (!startTimestamp && startTime) {
                setStartTimestamp(startTime);
                setStartTimeLabel(format(new Date(startTime), 'h:mma'));
            }
        } else {
            const now = Date.now();
            setElapsed(0);
            setStoppedDuration(null);
            setStartTimestamp(now);
            setEndTimestamp(null);
            setStartTimeLabel(format(new Date(now), 'h:mma'));
            setEndTimeLabel('');
            startTimer('sleep');
        }
    };

    const handleSave = () => {
        if (stoppedDuration === null) return;
        const durationFromTimes =
            startTimestamp && endTimestamp
                ? Math.max(0, Math.floor((endTimestamp - startTimestamp) / 1000))
                : stoppedDuration;
        addLog({
            type: 'sleep',
            timestamp: new Date().toISOString(),
            duration: durationFromTimes,
            details: {
                startTime: startTimeLabel,
                endTime: endTimeLabel,
                note: note?.trim() || undefined,
                startTimestamp: startTimestamp ?? undefined,
                endTimestamp: endTimestamp ?? undefined,
            },
        });
        setStoppedDuration(null);
        setElapsed(0);
        setStartTimestamp(null);
        setEndTimestamp(null);
        setStartTimeLabel('');
        setEndTimeLabel('');
        setNote('');
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const meridiems: Array<'AM' | 'PM'> = ['AM', 'PM'];

    const openPicker = (target: 'start' | 'end') => {
        const baseTime =
            target === 'start'
                ? (startTimestamp ? new Date(startTimestamp) : new Date())
                : (endTimestamp ? new Date(endTimestamp) : new Date());
        const hours24 = baseTime.getHours();
        const hour = hours24 % 12 || 12;
        const minute = baseTime.getMinutes();
        const meridiem = hours24 >= 12 ? 'PM' : 'AM';
        setPickerHour(hour);
        setPickerMinute(minute);
        setPickerMeridiem(meridiem);
        setPickerTarget(target);
        setPickerVisible(true);
    };

    const applyPicker = () => {
        const base = new Date();
        let hours24 = pickerHour % 12;
        if (pickerMeridiem === 'PM') hours24 += 12;
        base.setHours(hours24, pickerMinute, 0, 0);
        const label = format(base, 'h:mma');
        const timestamp = base.getTime();
        if (pickerTarget === 'start') {
            setStartTimestamp(timestamp);
            setStartTimeLabel(label);
            if (endTimestamp) {
                const duration = Math.max(0, Math.floor((endTimestamp - timestamp) / 1000));
                setStoppedDuration(duration);
                setElapsed(duration);
            }
        } else {
            setEndTimestamp(timestamp);
            setEndTimeLabel(label);
            if (startTimestamp) {
                const duration = Math.max(0, Math.floor((timestamp - startTimestamp) / 1000));
                setStoppedDuration(duration);
                setElapsed(duration);
            }
        }
        setPickerVisible(false);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <TrackingCard title="Sleep">
                <View style={styles.container}>
                    <Text variant="displayMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
                        {formatTime(elapsed)}
                    </Text>
                    <View style={styles.timeRow}>
                        <View style={styles.timeField}>
                            <Text variant="labelSmall" style={styles.timeLabel}>Start time</Text>
                            <Pressable onPress={() => openPicker('start')} style={styles.timePicker}>
                                <Text style={styles.timePickerText}>{startTimeLabel || 'Select time'}</Text>
                            </Pressable>
                        </View>
                        <View style={styles.timeField}>
                            <Text variant="labelSmall" style={styles.timeLabel}>Paused time</Text>
                            <Pressable onPress={() => openPicker('end')} style={styles.timePicker}>
                                <Text style={styles.timePickerText}>{endTimeLabel || 'Select time'}</Text>
                            </Pressable>
                        </View>
                    </View>
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
                        <SaveButton
                            onPress={handleSave}
                            style={[styles.button, styles.saveButton]}
                            height={48}
                        />
                    )}
                </View>
                <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setPickerVisible(false)}>
                        <Pressable style={styles.modalCard} onPress={() => {}}>
                            <Text variant="titleMedium" style={styles.modalTitle}>
                                Select time
                            </Text>
                            <View style={styles.pickerRow}>
                                <View style={styles.pickerColumn}>
                                    <Text variant="labelSmall" style={styles.pickerLabel}>Hour</Text>
                                    <ScrollView style={styles.pickerList}>
                                        {hours.map((hour) => (
                                            <Pressable
                                                key={hour}
                                                onPress={() => setPickerHour(hour)}
                                                style={[
                                                    styles.pickerItem,
                                                    pickerHour === hour && styles.pickerItemSelected,
                                                ]}
                                            >
                                                <Text style={styles.pickerItemText}>{hour}</Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                                <View style={styles.pickerColumn}>
                                    <Text variant="labelSmall" style={styles.pickerLabel}>Min</Text>
                                    <ScrollView style={styles.pickerList}>
                                        {minutes.map((minute) => (
                                            <Pressable
                                                key={minute}
                                                onPress={() => setPickerMinute(minute)}
                                                style={[
                                                    styles.pickerItem,
                                                    pickerMinute === minute && styles.pickerItemSelected,
                                                ]}
                                            >
                                                <Text style={styles.pickerItemText}>{minute.toString().padStart(2, '0')}</Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                                <View style={styles.pickerColumn}>
                                    <Text variant="labelSmall" style={styles.pickerLabel}>AM/PM</Text>
                                    <ScrollView style={styles.pickerList}>
                                        {meridiems.map((meridiem) => (
                                            <Pressable
                                                key={meridiem}
                                                onPress={() => setPickerMeridiem(meridiem)}
                                                style={[
                                                    styles.pickerItem,
                                                    pickerMeridiem === meridiem && styles.pickerItemSelected,
                                                ]}
                                            >
                                                <Text style={styles.pickerItemText}>{meridiem}</Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                            <View style={styles.modalActions}>
                                <Button onPress={() => setPickerVisible(false)}>Cancel</Button>
                                <Button mode="contained" onPress={applyPicker} buttonColor="#F59E0B" textColor="#FFFFFF">
                                    Done
                                </Button>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            </TrackingCard>
            <TrackingCard title="Notes">
                <TextInput
                    mode="outlined"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    style={styles.noteInput}
                    placeholder="Add a note... (Optional)"
                />
            </TrackingCard>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    timeField: {
        flex: 1,
    },
    timeLabel: {
        marginBottom: 6,
        opacity: 0.7,
    },
    timePicker: {
        borderWidth: 1,
        borderColor: '#D0D0D0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
    },
    timePickerText: {
        fontSize: 16,
    },
    noteInput: {
        backgroundColor: '#FFFFFF',
    },
    button: {
        borderRadius: 8,
    },
    saveButton: {
        marginTop: 12,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    modalTitle: {
        marginBottom: 12,
    },
    pickerRow: {
        flexDirection: 'row',
        gap: 12,
    },
    pickerColumn: {
        flex: 1,
    },
    pickerLabel: {
        marginBottom: 6,
        opacity: 0.7,
    },
    pickerList: {
        maxHeight: 180,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
    },
    pickerItem: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    pickerItemSelected: {
        backgroundColor: '#FFF1D6',
    },
    pickerItemText: {
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 12,
    },
});
