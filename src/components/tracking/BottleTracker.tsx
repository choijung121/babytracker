import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, TextInput } from 'react-native-paper';
import { useTrackerStore } from '../../store/useTrackerStore';
import { SaveButton } from './SaveButton';
import { TrackingCard } from './TrackingCard';

export const BottleTracker: React.FC = () => {
    const { addLog } = useTrackerStore();
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState<string>('oz');

    const handleSave = () => {
        if (!amount) return;
        addLog({
            type: 'bottle',
            timestamp: new Date().toISOString(),
            details: {
                amount: parseFloat(amount),
                unit: unit as 'oz' | 'ml',
            },
        });
        setAmount('');
    };

    return (
        <TrackingCard title="Bottle">
            <View style={styles.container}>
                <View style={styles.inputRow}>
                    <TextInput
                        label="Amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        mode="outlined"
                        style={{ flex: 1 }}
                    />
                    <SegmentedButtons
                        value={unit}
                        onValueChange={setUnit}
                        buttons={[
                            { value: 'oz', label: 'oz' },
                            { value: 'ml', label: 'ml' },
                        ]}
                        style={{ flex: 1 }}
                    />
                </View>
                <SaveButton onPress={handleSave} style={styles.saveButton} />
            </View>
        </TrackingCard>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    saveButton: {
        marginTop: 12,
        alignSelf: 'stretch',
        borderRadius: 8,
        marginHorizontal: 8,
    }
});
