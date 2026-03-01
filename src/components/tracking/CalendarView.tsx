import {
    addDays,
    addSeconds,
    addWeeks,
    differenceInMinutes,
    eachDayOfInterval,
    endOfDay,
    endOfWeek,
    format,
    isWithinInterval,
    startOfDay,
    startOfWeek,
    subDays,
    subWeeks,
} from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, IconButton, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { LogEntry } from '../../types/tracking';
import { useTrackerStore } from '../../store/useTrackerStore';
import { TrackingCard } from './TrackingCard';

const HOUR_HEIGHT = 56;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const INSTANT_MINUTES = 15;

const formatMinutes = (seconds?: number) => {
    const minutes = Math.max(0, Math.floor((seconds || 0) / 60));
    return `${minutes} mins`;
};

const formatTime = (timestamp: string) => format(new Date(timestamp), 'h:mm a');

const sumDuration = (logs: LogEntry[]) => logs.reduce((total, log) => total + (log.duration || 0), 0);

const getDayLogs = (logs: LogEntry[], day: Date) => {
    const start = startOfDay(day);
    const end = endOfDay(day);
    return logs.filter((log) =>
        isWithinInterval(new Date(log.timestamp), { start, end })
    );
};

const getEventColor = (type: LogEntry['type']) => {
    if (type === 'sleep') return '#4a90e2';
    if (type === 'diaper') return '#f4d03f';
    if (type === 'nursing' || type === 'bottle') return '#f5a623';
    return '#9b9b9b';
};

const getEventLabel = (log: LogEntry) => {
    if (log.type === 'sleep') return 'Sleep';
    if (log.type === 'nursing') return 'Feeding (Nursing)';
    if (log.type === 'bottle') return 'Feeding (Bottle)';
    if (log.type === 'diaper') return 'Diaper';
    return 'Activity';
};

const buildDailyEvents = (logs: LogEntry[], selectedDate: Date) => {
    const dayStart = startOfDay(selectedDate);
    const dayEndMinutes = 24 * 60;

    return logs.map((log) => {
        const startDate = new Date(log.timestamp);
        const startMinutes = Math.max(0, differenceInMinutes(startDate, dayStart));
        const durationMinutes = log.duration ? Math.max(1, Math.ceil(log.duration / 60)) : INSTANT_MINUTES;
        const endMinutes = Math.min(dayEndMinutes, startMinutes + durationMinutes);
        const endDate = log.duration ? addSeconds(startDate, log.duration) : null;

        return {
            id: log.id,
            type: log.type,
            label: getEventLabel(log),
            startMinutes,
            endMinutes,
            color: getEventColor(log.type),
            timeLabel: endDate
                ? `${formatTime(log.timestamp)} - ${formatTime(endDate.toISOString())}`
                : formatTime(log.timestamp),
        };
    });
};

export const CalendarView: React.FC = () => {
    const theme = useTheme();
    const { logs, removeLog } = useTrackerStore();
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

    const dailyLogs = useMemo(() => getDayLogs(logs, selectedDate), [logs, selectedDate]);

    const weeklyDays = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    const dailyEvents = useMemo(() => buildDailyEvents(dailyLogs, selectedDate), [dailyLogs, selectedDate]);

    const closeDetail = () => setSelectedLog(null);

    const getDetailTimes = (log: LogEntry) => {
        if (log.details?.startTimestamp && log.details?.endTimestamp) {
            return {
                start: formatTime(new Date(log.details.startTimestamp).toISOString()),
                end: formatTime(new Date(log.details.endTimestamp).toISOString()),
            };
        }
        if (log.duration) {
            const start = new Date(log.timestamp);
            const end = addSeconds(start, log.duration);
            return { start: formatTime(log.timestamp), end: formatTime(end.toISOString()) };
        }
        return { start: formatTime(log.timestamp), end: null };
    };

    return (
        <TrackingCard title="Calendar View">
                <View style={styles.headerRow}>
                    <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
                        {viewMode === 'daily'
                            ? format(selectedDate, 'EEEE, MMM d')
                            : `${format(weeklyDays[0], 'MMM d')} - ${format(weeklyDays[weeklyDays.length - 1], 'MMM d')}`}
                    </Text>
                    <View style={styles.navRow}>
                        <Button
                            mode="text"
                            onPress={() => setSelectedDate(new Date())}
                            style={styles.todayButton}
                        >
                            Today
                        </Button>
                        <IconButton
                            icon="chevron-left"
                            size={20}
                            onPress={() =>
                                setSelectedDate((prev) =>
                                    viewMode === 'daily' ? subDays(prev, 1) : subWeeks(prev, 1)
                                )
                            }
                        />
                        <IconButton
                            icon="chevron-right"
                            size={20}
                            onPress={() =>
                                setSelectedDate((prev) =>
                                    viewMode === 'daily' ? addDays(prev, 1) : addWeeks(prev, 1)
                                )
                            }
                        />
                    </View>
                </View>

            <SegmentedButtons
                value={viewMode}
                onValueChange={(value) => setViewMode(value as 'daily' | 'weekly')}
                buttons={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                ]}
                style={styles.segmented}
            />

                {viewMode === 'daily' ? (
                    <View style={styles.timelineSection}>
                        {dailyLogs.length === 0 && (
                            <Text style={styles.emptyText}>No records for this day.</Text>
                        )}
                        <View style={styles.timelineWrapper}>
                            <View style={styles.timeColumn}>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <View key={`label-${hour}`} style={[styles.hourLabelRow, { height: HOUR_HEIGHT }]}>
                                        <Text variant="bodySmall" style={styles.hourLabel}>
                                            {format(addSeconds(startOfDay(selectedDate), hour * 3600), 'ha')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.timelineColumn}>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <View
                                        key={`line-${hour}`}
                                        style={[styles.hourLine, { top: hour * HOUR_HEIGHT }]}
                                    />
                                ))}
                                {dailyEvents.map((event) => {
                                    const height = Math.max(18, (event.endMinutes - event.startMinutes) * MINUTE_HEIGHT);
                                    const top = event.startMinutes * MINUTE_HEIGHT;
                                    return (
                                        <Pressable
                                            key={event.id}
                                            style={[
                                                styles.eventBlock,
                                                {
                                                    top,
                                                    height,
                                                    backgroundColor: event.color,
                                                },
                                            ]}
                                            onPress={() => {
                                                const match = dailyLogs.find((log) => log.id === event.id);
                                                if (match) setSelectedLog(match);
                                            }}
                                        >
                                            <Text style={styles.eventTitle}>{event.label}</Text>
                                            <Text style={styles.eventTime}>{event.timeLabel}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.weeklyContainer}>
                        {weeklyDays.map((day) => {
                            const dayLogs = getDayLogs(logs, day);
                            const dayNursing = dayLogs.filter((log) => log.type === 'nursing');
                            const dayBottle = dayLogs.filter((log) => log.type === 'bottle');
                            const daySleep = dayLogs.filter((log) => log.type === 'sleep');
                            const dayDiaper = dayLogs.filter((log) => log.type === 'diaper');

                            return (
                                <View key={day.toISOString()} style={styles.weekDayRow}>
                                    <View style={styles.weekDayHeader}>
                                        <Text variant="titleSmall">{format(day, 'EEE')}</Text>
                                        <Text variant="bodySmall" style={styles.weekDayDate}>
                                            {format(day, 'MMM d')}
                                        </Text>
                                    </View>
                                    {dayLogs.length === 0 ? (
                                        <Text style={styles.emptyText}>No records</Text>
                                    ) : (
                                        <View style={styles.weekSummary}>
                                            <Text variant="bodySmall">
                                                Sleep: {formatMinutes(sumDuration(daySleep))}
                                            </Text>
                                            <Text variant="bodySmall">
                                                Feeding: {formatMinutes(sumDuration(dayNursing))} · {dayBottle.length} bottle times
                                            </Text>
                                            <Text variant="bodySmall">
                                                Diaper: {dayDiaper.length} changes
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            <Modal visible={!!selectedLog} transparent animationType="fade" onRequestClose={closeDetail}>
                <Pressable style={styles.modalBackdrop} onPress={closeDetail}>
                    <Pressable style={styles.detailCard} onPress={() => {}}>
                        {selectedLog && (() => {
                            const times = getDetailTimes(selectedLog);
                            const durationLabel = selectedLog.duration ? formatMinutes(selectedLog.duration) : null;
                            const label = getEventLabel(selectedLog);
                            const color = getEventColor(selectedLog.type);
                            return (
                                <View style={styles.detailContent}>
                                    <View style={styles.detailHeader}>
                                        <View style={[styles.colorDot, { backgroundColor: color }]} />
                                        <Text variant="titleMedium">{label}</Text>
                                    </View>
                                    <Text variant="bodySmall" style={styles.detailRow}>
                                        Time: {times.end ? `${times.start} - ${times.end}` : times.start}
                                    </Text>
                                    {durationLabel && (
                                        <Text variant="bodySmall" style={styles.detailRow}>
                                            Duration: {durationLabel}
                                        </Text>
                                    )}
                                    {selectedLog.type === 'nursing' && selectedLog.details?.side && (
                                        <Text variant="bodySmall" style={styles.detailRow}>
                                            Side: {selectedLog.details.side}
                                        </Text>
                                    )}
                                    {selectedLog.type === 'bottle' && selectedLog.details?.amount && selectedLog.details?.unit && (
                                        <Text variant="bodySmall" style={styles.detailRow}>
                                            Amount: {selectedLog.details.amount} {selectedLog.details.unit}
                                        </Text>
                                    )}
                                    {selectedLog.type === 'diaper' && selectedLog.details?.contents?.length ? (
                                        <Text variant="bodySmall" style={styles.detailRow}>
                                            Contents: {selectedLog.details.contents.join(' & ')}
                                        </Text>
                                    ) : null}
                                    <View style={styles.detailActions}>
                                        <Button onPress={closeDetail}>Close</Button>
                                        <Button
                                            mode="contained"
                                            buttonColor={theme.colors.error}
                                            onPress={() => {
                                                removeLog(selectedLog.id);
                                                closeDetail();
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </View>
                                </View>
                            );
                        })()}
                    </Pressable>
                </Pressable>
            </Modal>
        </TrackingCard>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: -8,
    },
    todayButton: {
        marginRight: 4,
    },
    segmented: {
        marginBottom: 12,
    },
    emptyText: {
        opacity: 0.6,
        marginBottom: 8,
    },
    timelineSection: {
        gap: 8,
    },
    timelineWrapper: {
        flexDirection: 'row',
        minHeight: HOUR_HEIGHT * 24,
    },
    timeColumn: {
        width: 56,
        paddingRight: 8,
    },
    hourLabelRow: {
        justifyContent: 'flex-start',
    },
    hourLabel: {
        color: '#6c6c6c',
    },
    timelineColumn: {
        flex: 1,
        position: 'relative',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.12)',
        minHeight: HOUR_HEIGHT * 24,
    },
    hourLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    eventBlock: {
        position: 'absolute',
        left: 8,
        right: 8,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    eventTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1b1b1b',
    },
    eventTime: {
        fontSize: 11,
        color: '#1b1b1b',
        opacity: 0.8,
    },
    weeklyContainer: {
        gap: 12,
    },
    weekDayRow: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    weekDayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    weekDayDate: {
        opacity: 0.6,
    },
    weekSummary: {
        gap: 4,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    detailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    detailContent: {
        gap: 8,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    detailRow: {
        opacity: 0.8,
    },
    detailActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
});
