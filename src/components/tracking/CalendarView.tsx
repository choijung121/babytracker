import {
    addDays,
    addWeeks,
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
import { StyleSheet, View } from 'react-native';
import { Divider, IconButton, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { LogEntry } from '../../types/tracking';
import { useTrackerStore } from '../../store/useTrackerStore';
import { TrackingCard } from './TrackingCard';

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

const formatTimesList = (times: string[]) => {
    if (times.length === 0) return 'None';
    if (times.length <= 3) return times.join(', ');
    return `${times.slice(0, 3).join(', ')} +${times.length - 3} more`;
};

export const CalendarView: React.FC = () => {
    const theme = useTheme();
    const { logs } = useTrackerStore();
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    const dailyLogs = useMemo(() => getDayLogs(logs, selectedDate), [logs, selectedDate]);

    const weeklyDays = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    const renderDailySection = (title: string, content: React.ReactNode) => (
        <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>{title}</Text>
            <Text variant="bodyMedium" style={styles.sectionBody}>{content}</Text>
        </View>
    );

    const nursingLogs = dailyLogs.filter((log) => log.type === 'nursing');
    const bottleLogs = dailyLogs.filter((log) => log.type === 'bottle');
    const sleepLogs = dailyLogs.filter((log) => log.type === 'sleep');
    const diaperLogs = dailyLogs.filter((log) => log.type === 'diaper');

    return (
        <TrackingCard title="Calendar View">
            <View style={styles.headerRow}>
                <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
                    {viewMode === 'daily'
                        ? format(selectedDate, 'EEEE, MMM d')
                        : `${format(weeklyDays[0], 'MMM d')} - ${format(weeklyDays[weeklyDays.length - 1], 'MMM d')}`}
                </Text>
                <View style={styles.navRow}>
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
                dailyLogs.length === 0 ? (
                    <Text style={styles.emptyText}>No records for this day.</Text>
                ) : (
                    <View style={styles.dailyContainer}>
                        {renderDailySection(
                            'Nursing (length)',
                            `${formatMinutes(sumDuration(nursingLogs))} total · ${nursingLogs.length} sessions`
                        )}
                        <Divider />
                        {renderDailySection(
                            'Bottle (time recorded)',
                            formatTimesList(bottleLogs.map((log) => formatTime(log.timestamp)))
                        )}
                        <Divider />
                        {renderDailySection(
                            'Sleep (length)',
                            `${formatMinutes(sumDuration(sleepLogs))} total · ${sleepLogs.length} sessions`
                        )}
                        <Divider />
                        {renderDailySection(
                            'Diaper (time recorded)',
                            formatTimesList(diaperLogs.map((log) => formatTime(log.timestamp)))
                        )}
                    </View>
                )
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
                                            Nursing: {formatMinutes(sumDuration(dayNursing))}
                                        </Text>
                                        <Text variant="bodySmall">
                                            Bottle: {formatTimesList(dayBottle.map((log) => formatTime(log.timestamp)))}
                                        </Text>
                                        <Text variant="bodySmall">
                                            Sleep: {formatMinutes(sumDuration(daySleep))}
                                        </Text>
                                        <Text variant="bodySmall">
                                            Diaper: {formatTimesList(dayDiaper.map((log) => formatTime(log.timestamp)))}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
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
    segmented: {
        marginBottom: 12,
    },
    dailyContainer: {
        gap: 12,
    },
    weeklyContainer: {
        gap: 12,
    },
    section: {
        gap: 6,
    },
    sectionTitle: {
        fontWeight: '600',
    },
    sectionBody: {
        opacity: 0.8,
    },
    emptyText: {
        opacity: 0.6,
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
});
