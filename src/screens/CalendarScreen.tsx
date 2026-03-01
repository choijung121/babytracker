import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarView } from '../components/tracking/CalendarView';

export default function CalendarScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.scrollContent}>
                <Text variant="headlineMedium" style={styles.header}>Calendar</Text>
                <View style={styles.calendarContainer}>
                    <CalendarView />
                </View>
            </View>
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
        flex: 1,
    },
    header: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    calendarContainer: {
        flex: 1,
    },
});
