import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';

type SaveButtonProps = {
    onPress: () => void;
    label?: string;
    height?: number;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
};

export const SaveButton: React.FC<SaveButtonProps> = ({
    onPress,
    label = 'Save',
    height = 44,
    style,
    disabled = false,
}) => {
    return (
        <Button
            mode="contained"
            onPress={onPress}
            style={style}
            buttonColor="#F59E0B"
            textColor="#FFFFFF"
            contentStyle={[styles.content, { height }]}
            disabled={disabled}
        >
            {label}
        </Button>
    );
};

const styles = StyleSheet.create({
    content: {
        justifyContent: 'center',
    },
});
