import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, IconButton, List, Text } from 'react-native-paper';
import { useTrackerStore } from '../../store/useTrackerStore';

export const DailySummary: React.FC = () => {
    const { logs, removeLog } = useTrackerStore();

    const getIcon = (type: string) => {
        switch (type) {
            case 'sleep': return 'bed-clock';
            case 'nursing': return 'baby-bottle-outline'; // Generic bottle for feeding
            case 'bottle': return 'bottle-tonic';
            case 'diaper': return 'baby-face-outline';
            default: return 'playlist-edit';
        }
    };

    const getDescription = (log: any) => {
        if (log.type === 'sleep') {
            const minutes = Math.floor((log.duration || 0) / 60);
            return `Duration: ${minutes} mins`;
        }
        if (log.type === 'nursing') {
            const minutes = Math.floor((log.duration || 0) / 60);
            return `${log.details?.side === 'left' ? 'Left' : 'Right'} breast - ${minutes} mins`;
        }
        if (log.type === 'bottle') {
            return `${log.details?.amount} ${log.details?.unit}`;
        }
        if (log.type === 'diaper') {
            return log.details?.contents?.join(' & ');
        }
        return log.details?.note;
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>Daily Summary</Text>
            {logs.length === 0 ? (
                <Text style={styles.emptyText}>No activities logged today</Text>
            ) : (
                logs.map((log) => (
                    <React.Fragment key={log.id}>
                        <List.Item
                            title={log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                            description={getDescription(log)}
                            left={props => <List.Icon {...props} icon={getIcon(log.type)} />}
                            right={props => (
                                <View style={styles.rightContainer}>
                                    <Text variant="bodySmall">{format(new Date(log.timestamp), 'h:mm a')}</Text>
                                    <IconButton icon="delete" size={20} onPress={() => removeLog(log.id)} />
                                </View>
                            )}
                        />
                        <Divider />
                    </React.Fragment>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingBottom: 40,
    },
    title: {
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    emptyText: {
        paddingHorizontal: 16,
        opacity: 0.6,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});
