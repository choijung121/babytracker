import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NursingTracker } from '../components/tracking/NursingTracker';

export default function NursingScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineMedium" style={styles.header}>Nursing</Text>
                <NursingTracker />
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
        marginBottom: 16,
        fontWeight: 'bold',
    },
});
