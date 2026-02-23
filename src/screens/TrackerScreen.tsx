import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrackerStore } from '../store/useTrackerStore';

export default function TrackerScreen() {
    const { logs } = useTrackerStore();

    const getLastLog = (type: string) => logs.find((log) => log.type === type);

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const getSleepMeta = () => {
        const log = getLastLog('sleep');
        if (!log) return 'No logs yet';
        const ago = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });
        const duration = formatDuration(log.duration);
        return `${ago} \u2022 ${duration}`;
    };

    const getNursingMeta = () => {
        const log = getLastLog('nursing');
        if (!log) return 'No logs yet';
        const ago = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });
        const duration = formatDuration(log.duration);
        const side = log.details?.side === 'left' ? 'L' : 'R';
        return `${ago} \u2022 ${side} ${duration}`;
    };

    const getBottleMeta = () => {
        const log = getLastLog('bottle');
        if (!log) return 'No logs yet';
        const ago = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });
        const amount = log.details?.amount ?? '';
        const unit = log.details?.unit ?? '';
        return `${ago} \u2022 ${amount}${unit}`;
    };

    const getDiaperMeta = () => {
        const log = getLastLog('diaper');
        if (!log) return 'No logs yet';
        const ago = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });
        const contents = log.details?.contents?.join(' & ') ?? '';
        return `${ago} \u2022 ${contents}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineMedium" style={styles.header}>Baby Tracker</Text>

                <Pressable style={[styles.card, styles.sleepCard]} onPress={() => router.push('/trackers/sleep')}>
                    <View>
                        <Text variant="titleLarge" style={styles.cardTitle}>Sleep</Text>
                        <Text style={styles.cardMeta}>{getSleepMeta()}</Text>
                    </View>
                </Pressable>

                <View style={styles.row}>
                    <Pressable style={[styles.card, styles.halfCard, styles.nursingCard]} onPress={() => router.push('/trackers/nursing')}>
                        <Text variant="titleMedium" style={styles.cardTitle}>Nursing</Text>
                        <Text style={styles.cardMeta}>{getNursingMeta()}</Text>
                    </Pressable>
                    <Pressable style={[styles.card, styles.halfCard, styles.bottleCard]} onPress={() => router.push('/trackers/bottle')}>
                        <Text variant="titleMedium" style={styles.cardTitle}>Bottle</Text>
                        <Text style={styles.cardMeta}>{getBottleMeta()}</Text>
                    </Pressable>
                </View>

                <Pressable style={[styles.card, styles.diaperCard]} onPress={() => router.push('/trackers/diaper')}>
                    <Text variant="titleLarge" style={styles.cardTitle}>Diaper</Text>
                    <Text style={styles.cardMeta}>{getDiaperMeta()}</Text>
                </Pressable>

                <Pressable style={[styles.card, styles.summaryCard]} onPress={() => router.push('/summary')}>
                    <Text variant="titleLarge" style={styles.cardTitle}>Daily Summary</Text>
                    <Text style={styles.cardMeta}>View all logs</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    header: {
        marginBottom: 24,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    card: {
        borderRadius: 18,
        padding: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    halfCard: {
        flex: 1,
        minHeight: 120,
    },
    cardTitle: {
        color: '#FFFFFF',
        marginBottom: 6,
    },
    cardMeta: {
        color: '#FFFFFF',
        opacity: 0.9,
    },
    sleepCard: {
        backgroundColor: '#2BBFD9',
        minHeight: 120,
    },
    nursingCard: {
        backgroundColor: '#FF7A3D',
    },
    bottleCard: {
        backgroundColor: '#FF7A3D',
    },
    diaperCard: {
        backgroundColor: '#F4C542',
        minHeight: 110,
    },
    summaryCard: {
        backgroundColor: '#9B7BFF',
        minHeight: 110,
    },
});
