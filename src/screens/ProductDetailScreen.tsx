import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Dimensions, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import ImageViewing from 'react-native-image-viewing';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStore, Product } from '../store/useStore';
import { theme } from '../theme';
import { useToast } from '../components/Toast';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const GenericProductView = ({ product, onImagePress, onAddToCart }: { product: Product, onImagePress: () => void, onAddToCart: (opt: string) => void }) => {
    const [isNoteInputVisible, setNoteInputVisible] = useState(false);
    const [noteText, setNoteText] = useState('');
    const { showToast } = useToast();

    const handleAddNote = () => {
        if (!noteText.trim()) {
            showToast('Please enter a note', 'error');
            return;
        }
        onAddToCart(`Note: ${noteText}`);
        setNoteInputVisible(false);
        setNoteText('');
    };

    return (
        <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={onImagePress} activeOpacity={0.9} style={styles.imageCard}>
                <FastImage
                    style={styles.image}
                    source={{
                        uri: product.localImagePath || product.imageUrl || 'https://via.placeholder.com/400.png?text=No+Image',
                        priority: FastImage.priority.high,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                />
                <View style={styles.zoomHint}>
                    <Text style={styles.zoomText}>Tap to zoom</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{product.productName}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoBadge}>
                        <Text style={styles.infoLabel}>Stock Available</Text>
                        <Text style={styles.infoValue}>{product.quantity}</Text>
                    </View>

                </View>

                <View style={styles.divider} />

                <View style={styles.actions}>
                    <Text style={styles.actionTitle}>Add to Cart</Text>
                    <Text style={styles.actionSubtitle}>Select a quantity set or add a custom note</Text>

                    <View style={styles.btnRow}>
                        {['1 Set', '2 Sets', '3 Sets'].map(opt => (
                            <TouchableOpacity key={opt} style={styles.optBtn} onPress={() => onAddToCart(opt)}>
                                <Text style={styles.optText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {!isNoteInputVisible ? (
                        <TouchableOpacity style={[styles.optBtn, styles.noteBtn]} onPress={() => setNoteInputVisible(true)}>
                            <Text style={styles.noteBtnText}>+ Add Special Note / Custom Qty</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.noteContainer}>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Enter your custom note here..."
                                placeholderTextColor="#999"
                                value={noteText}
                                onChangeText={setNoteText}
                                multiline
                            />
                            <View style={styles.noteActions}>
                                <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setNoteInputVisible(false)}>
                                    <Text style={styles.smallBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.confirmBtn]} onPress={handleAddNote}>
                                    <Text style={styles.smallBtnText}>Add to Cart</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const ProductDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { product, groupName } = route.params;
    const store = useStore();
    const cart = store.cart;
    const { showToast } = useToast();

    const brand = store.brands.find(b => b.groupName === groupName);
    const products = brand ? brand.products : [product];

    const initialIndex = products.findIndex(p => p.productName === product.productName);
    const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);

    const images = products.map(p => ({
        uri: p.localImagePath || p.imageUrl || 'https://via.placeholder.com/800.png?text=No+Image'
    }));

    const handleAddToCart = (item: Product, option: string) => {
        store.addToCart({
            id: item.productName,
            product: item,
            selection: option
        });
        showToast(`Added ${item.productName} (${option})`, 'success');
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            title: groupName || 'Details',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: theme.colors.secondary,
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Cart')}
                    style={{ marginRight: 0, padding: 5 }}
                >
                    <Icon name="shopping-cart" size={24} color={theme.colors.secondary} />
                    {cart.length > 0 && (
                        <View style={styles.headerCartBadge}>
                            <Text style={styles.headerCartBadgeText}>{cart.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, groupName, cart.length]);

    return (
        <View style={styles.container}>
            {/* Optimized with FlatList for paging */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.productName}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
                renderItem={({ item }) => (
                    <View style={{ width: width, flex: 1 }}>
                        <GenericProductView
                            product={item}
                            onImagePress={() => setIsImageViewVisible(true)}
                            onAddToCart={(opt) => handleAddToCart(item, opt)}
                        />
                    </View>
                )}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setSelectedIndex(index);
                }}
                windowSize={3}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
            />

            <ImageViewing
                images={images}
                imageIndex={selectedIndex}
                visible={isImageViewVisible}
                onRequestClose={() => setIsImageViewVisible(false)}
                onImageIndexChange={(idx) => setSelectedIndex(idx)}
            />
        </View>
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
    container: { flex: 1, backgroundColor: theme.colors.surface },
    pagerView: { flex: 1 },
    page: { flex: 1 },
    pageContent: { paddingBottom: 40 },
    imageCard: {
        width: width,
        height: width * 1.1, // Slightly taller than square
        backgroundColor: '#fff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 20,
    },
    image: { width: '100%', height: '100%' },
    zoomHint: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    zoomText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    detailsContainer: { paddingHorizontal: 24 },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 16,
        color: theme.colors.secondary,
        letterSpacing: 0.5
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15
    },
    infoBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#546e7a',
        fontWeight: '600',
        marginBottom: 4
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 24
    },
    actions: {},
    actionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 4
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 10
    },
    optBtn: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 1,
    },
    optText: {
        color: theme.colors.secondary,
        fontWeight: '700',
        fontSize: 14
    },
    noteBtn: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
        flex: 0,
        width: '100%'
    },
    noteBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15
    },
    noteContainer: {
        marginTop: 10,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    noteInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 15,
        fontSize: 16,
        color: '#333'
    },
    noteActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10
    },
    actionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelBtn: {
        backgroundColor: '#f0f0f0',
    },
    confirmBtn: {
        backgroundColor: theme.colors.success,
    },
    smallBtnText: {
        fontWeight: '600',
        fontSize: 14,
        color: '#333'
    }
});

export default ProductDetailScreen;
