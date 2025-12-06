import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Switch } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import FastImage from 'react-native-fast-image';
import { useStore, Product, Brand } from '../store/useStore';
import { useNavigation } from '@react-navigation/native';
import { syncData } from '../api/sync';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utility for Title Case
const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

type ListItem =
    | (Brand & { type: 'header' })
    | { type: 'product'; product: Product; groupName: string };

const HomeScreen = () => {
    const { brands, toggleBrandCollapse, syncStatus, lastSynced } = useStore();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyImages, setShowOnlyImages] = useState(false);

    useEffect(() => {
        // Initial sync handled by user via button or could be auto
    }, []);

    const data = useMemo<ListItem[]>(() => {
        const listItems: any[] = [];
        const query = searchQuery.toLowerCase().trim();

        brands.forEach((brand) => {
            const brandMatches = brand.groupName.toLowerCase().includes(query);

            // Filter Logic
            if (query === '') {
                // Default view - Check Image Filter
                const filteredProducts = showOnlyImages
                    ? brand.products.filter(p => (p.localImagePath || p.imageUrl))
                    : brand.products;

                if (filteredProducts.length > 0) {
                    listItems.push({ type: 'header', ...brand });
                    if (brand.isExpanded !== false) {
                        filteredProducts.forEach((p) => {
                            listItems.push({ type: 'product', product: p, groupName: brand.groupName });
                        });
                    }
                }
            } else {
                // Search Mode
                if (brandMatches) {
                    // Show brand header and relevant products
                    const relevantProducts = showOnlyImages
                        ? brand.products.filter(p => (p.localImagePath || p.imageUrl))
                        : brand.products;

                    if (relevantProducts.length > 0) {
                        listItems.push({ type: 'header', ...brand, isExpanded: true });
                        relevantProducts.forEach((p) => {
                            listItems.push({ type: 'product', product: p, groupName: brand.groupName });
                        });
                    }
                } else {
                    // Check products by name
                    let matchingProducts = brand.products.filter(p => p.productName.toLowerCase().includes(query));

                    if (showOnlyImages) {
                        matchingProducts = matchingProducts.filter(p => (p.localImagePath || p.imageUrl));
                    }

                    if (matchingProducts.length > 0) {
                        listItems.push({ type: 'header', ...brand, isExpanded: true });
                        matchingProducts.forEach((p) => {
                            listItems.push({ type: 'product', product: p, groupName: brand.groupName });
                        });
                    }
                }
            }
        });
        return listItems;
    }, [brands, searchQuery, showOnlyImages]);

    const renderItem = ({ item }: { item: ListItem }) => {
        if (item.type === 'header') {
            return (
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => toggleBrandCollapse(item.groupName)}
                >
                    <Text style={styles.headerText}>{item.groupName} ({item.products ? item.products.length : ''})</Text>
                </TouchableOpacity>
            );
        }

        // Product Item
        const p: Product = item.product;
        const displayName = toTitleCase(p.productName);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { product: p, groupName: item.groupName })}
            >
                <View style={styles.imageContainer}>
                    <FastImage
                        style={styles.image}
                        source={{
                            uri: p.localImagePath || p.imageUrl || 'https://via.placeholder.com/150',
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </View>
                <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={2}>{displayName}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.qtyText}>Qty: {p.quantity}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

            <View style={styles.topContainer}>
                <View style={styles.topBar}>
                    <Text style={styles.title}>e-sbe</Text>
                    <View style={styles.actions}>
                        <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
                            <TouchableOpacity style={styles.syncBtn} onPress={() => syncData()}>
                                <Text style={styles.syncText}>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}</Text>
                            </TouchableOpacity>
                            <Text style={styles.lastSync}>
                                {lastSynced ? new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                            <Text style={styles.cartText}>Cart</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products or brands..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterContainer}>
                    <Text style={styles.filterText}>Show only articles with images</Text>
                    <Switch
                        value={showOnlyImages}
                        onValueChange={setShowOnlyImages}
                        trackColor={{ false: "#767577", true: "#3498db" }}
                        thumbColor={showOnlyImages ? "#ecf0f1" : "#f4f3f4"}
                    />
                </View>
            </View>

            <FlashList<ListItem>
                data={data}
                renderItem={renderItem}
                // @ts-ignore
                estimatedItemSize={260}
                numColumns={2}
                getItemType={(item) => item.type}
                overrideItemLayout={(layout: any, item) => {
                    if (item.type === 'header') {
                        layout.span = 2; // Full width
                        layout.size = 60;
                    } else {
                        layout.size = 300; // Increased size for aspect ratio
                    }
                }}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    topContainer: {
        backgroundColor: '#2c3e50',
        paddingBottom: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    syncBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
    },
    syncText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12
    },
    lastSync: {
        fontSize: 10,
        color: '#rgba(255,255,255,0.6)',
        marginTop: 2
    },
    cartBtn: {
        backgroundColor: '#e74c3c',
        padding: 8,
        borderRadius: 8,
        elevation: 3
    },
    cartText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },
    searchContainer: {
        paddingHorizontal: 15,
        marginTop: 5
    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333',
        elevation: 2
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 10
    },
    filterText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },
    header: {
        backgroundColor: 'transparent',
        padding: 10,
        marginTop: 10,
        marginBottom: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#3498db',
        marginLeft: 10
    },
    headerText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2c3e50',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4, // 3:4 portrait ratio
        backgroundColor: '#ecf0f1',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    details: {
        padding: 12,
        backgroundColor: '#fff'
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        height: 40,
        lineHeight: 20
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#ecf0f1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    qtyText: {
        fontSize: 12,
        color: '#7f8c8d',
        fontWeight: '600'
    }
});

export default HomeScreen;
