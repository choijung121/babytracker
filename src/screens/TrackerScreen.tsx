import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottleTracker } from '../components/tracking/BottleTracker';
import { DailySummary } from '../components/tracking/DailySummary';
import { DiaperTracker } from '../components/tracking/DiaperTracker';
import { NursingTracker } from '../components/tracking/NursingTracker';
import { SleepTracker } from '../components/tracking/SleepTracker';

export default function TrackerScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineMedium" style={styles.header}>Baby Tracker</Text>

                <SleepTracker />
                <NursingTracker />
                <BottleTracker />
                <DiaperTracker />

                <DailySummary />
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
    },
    header: {
        marginBottom: 24,
        fontWeight: 'bold',
    },
});
