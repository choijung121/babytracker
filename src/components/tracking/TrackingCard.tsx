import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface TrackingCardProps {
    title: string;
    icon?: string;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({ title, children, style, contentStyle }) => {
    const theme = useTheme();

    return (
        <Card style={[styles.card, style]}>
            <Card.Content style={contentStyle}>
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
