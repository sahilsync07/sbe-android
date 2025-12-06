import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import PagerView from 'react-native-pager-view';
import FastImage from 'react-native-fast-image';
import ImageViewing from 'react-native-image-viewing';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStore, Product } from '../store/useStore';

const GenericProductView = ({ product, onImagePress, onAddToCart }: { product: Product, onImagePress: () => void, onAddToCart: (opt: string) => void }) => {
    return (
        <ScrollView contentContainerStyle={styles.pageContent}>
            <TouchableOpacity onPress={onImagePress}>
                <FastImage
                    style={styles.image}
                    source={{
                        uri: product.localImagePath || product.imageUrl || 'https://via.placeholder.com/400',
                        priority: FastImage.priority.high,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                />
            </TouchableOpacity>
            <View style={styles.details}>
                <Text style={styles.title}>{product.productName}</Text>
                <Text style={styles.info}>Quantity Available: {product.quantity}</Text>
                <Text style={styles.desc}>Tap image to zoom</Text>

                <View style={styles.actions}>
                    <Text style={styles.actionTitle}>Add to Cart:</Text>
                    <View style={styles.btnRow}>
                        {['1 Set', '2 Sets', '3 Sets'].map(opt => (
                            <TouchableOpacity key={opt} style={styles.optBtn} onPress={() => onAddToCart(opt)}>
                                <Text style={styles.optText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={[styles.optBtn, styles.noteBtn]} onPress={() => onAddToCart('Custom')}>
                        <Text style={styles.optText}>Note / Custom</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const ProductDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { product, groupName } = route.params;
    const store = useStore();

    const brand = store.brands.find(b => b.groupName === groupName);
    const products = brand ? brand.products : [product];

    const initialIndex = products.findIndex(p => p.productName === product.productName);
    const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);

    const images = products.map(p => ({
        uri: p.localImagePath || p.imageUrl || 'https://via.placeholder.com/400'
    }));

    const handleAddToCart = (item: Product, option: string) => {
        store.addToCart({
            id: item.productName,
            product: item,
            selection: option
        });
        Alert.alert('Success', 'Added to Cart');
    };

    return (
        <View style={styles.container}>
            <PagerView
                style={styles.pagerView}
                initialPage={initialIndex}
                onPageSelected={(e) => setSelectedIndex(e.nativeEvent.position)}
            >
                {products.map((p, index) => (
                    <View key={index} style={styles.page}>
                        <GenericProductView
                            product={p}
                            onImagePress={() => setIsImageViewVisible(true)}
                            onAddToCart={(opt) => handleAddToCart(p, opt)}
                        />
                    </View>
                ))}
            </PagerView>

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
    container: { flex: 1, backgroundColor: '#fff' },
    pagerView: { flex: 1 },
    page: { flex: 1 },
    pageContent: { padding: 20 },
    image: { width: '100%', height: 300, backgroundColor: '#eee', marginBottom: 20 },
    details: { padding: 10 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#000' },
    info: { fontSize: 16, color: '#444', marginBottom: 20 },
    desc: { fontSize: 14, color: '#888', marginBottom: 20, fontStyle: 'italic' },
    actions: { marginTop: 20 },
    actionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    btnRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
    optBtn: { backgroundColor: '#333', padding: 10, borderRadius: 5, minWidth: 80, alignItems: 'center' },
    optText: { color: '#fff', fontWeight: 'bold' },
    noteBtn: { backgroundColor: '#555', alignSelf: 'center', width: '100%' }
});

export default ProductDetailScreen;
