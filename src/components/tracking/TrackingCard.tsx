import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface TrackingCardProps {
    title: string;
    icon?: string;
    children: React.ReactNode;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({ title, children }) => {
    const theme = useTheme();

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                        {title}
                    </Text>
                </View>
                <View style={styles.content}>{children}</View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    header: {
        marginBottom: 12,
    },
    content: {
        gap: 12,
    },
});
