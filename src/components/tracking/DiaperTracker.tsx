import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { useTrackerStore } from '../../store/useTrackerStore';
import { TrackingCard } from './TrackingCard';

export const DiaperTracker: React.FC = () => {
    const { addLog } = useTrackerStore();
    const [selection, setSelection] = useState<('pee' | 'poo')[]>([]);

    const toggleSelection = (type: 'pee' | 'poo') => {
        if (selection.includes(type)) {
            setSelection(selection.filter(t => t !== type));
        } else {
            setSelection([...selection, type]);
        }
    };

    const handleSave = () => {
        if (selection.length === 0) return;
        addLog({
            type: 'diaper',
            timestamp: new Date().toISOString(),
            details: { contents: selection },
        });
        setSelection([]);
    };

    return (
        <TrackingCard title="Diaper">
            <View style={styles.container}>
                <View style={styles.chipRow}>
                    <Chip
                        selected={selection.includes('pee')}
                        onPress={() => toggleSelection('pee')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        Pee
                    </Chip>
                    <Chip
                        selected={selection.includes('poo')}
                        onPress={() => toggleSelection('poo')}
                        showSelectedOverlay
                        style={styles.chip}
                    >
                        Poo
                    </Chip>
                </View>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    disabled={selection.length === 0}
                >
                    Save Diaper
                </Button>
            </View>
        </TrackingCard>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    chip: {
        minWidth: 80,
        justifyContent: 'center',
    },
});
