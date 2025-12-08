import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';

export const HeaderCartButton = ({ navigation: propNavigation }: { navigation?: any }) => {
    const navHook = useNavigation<any>();
    const navigation = propNavigation || navHook;
    const cart = useStore(state => state.cart);

    return (
        <TouchableOpacity
            onPress={() => {
                console.log('Navigating to Cart');
                // Ensure we navigate to Cart and not push it if already there (though unlikely in stack)
                navigation.navigate('Cart');
            }}
            style={{ marginRight: 10, padding: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Icon name="shopping-cart" size={24} color={theme.colors.secondary} />
            {cart.length > 0 && (
                <View style={styles.headerCartBadge}>
                    <Text style={styles.headerCartBadgeText}>{cart.length}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    headerCartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: theme.colors.accent,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    headerCartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center'
    },
});
