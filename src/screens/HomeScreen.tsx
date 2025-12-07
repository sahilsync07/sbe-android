import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Switch, Dimensions, Animated, Easing, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import FastImage from 'react-native-fast-image';
import { useStore, Product, Brand } from '../store/useStore';
import { useNavigation } from '@react-navigation/native';
import { syncData } from '../api/sync';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

// Utility for Title Case
const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

// --- Configuration for Groups ---
const PARAGON_SUBGROUPS = [
    "Walkaholic",
    "VERTEX, SLICKERS & FENDER",
    "Stimulus",
    "Solea & Meriva , Mascara",
    "P-TOES",
    "Paralite",
    "PARAGON COMFY",
    "Paragon Blot",
    "PARAGON",
    "Max",
    "Hawai Chappal",
];

const GENERAL_ITEMS_SUBGROUPS = [
    "AIRFAX",
    "Airsun",
    "J.K Plastic",
    "SRG ENTERPRISES",
    "VARDHMAN PLASTICS",
    "NAV DURGA ENTERPRISES",
    "AAGAM POLYMER",
    "Magnet",
    "MARUTI PLASTICS",
    "Fencer",
    "PANKAJ PLASTIC",
    "PARIS",
    "PU-LION",
    "SHYAM",
    "TEUZ",
    "UAM FOOTWEAR",
    "Xpania",
    "R K TRADERS",
    // Fallbacks for any variations mentioned
    "Maruti",
    "Magnet",
    "rktraders",
    "jkplastic",
    "airson"
];

const normalizeName = (name: string) => name ? name.toLowerCase().trim() : '';

type MetaHeaderItem = { type: 'meta-header'; title: string };
type BrandHeaderItem = Brand & { type: 'header' };
type ProductItem = { type: 'product'; product: Product; groupName: string };

type ListItem = MetaHeaderItem | BrandHeaderItem | ProductItem;

const HomeScreen = () => {
    const { brands, toggleBrandCollapse, syncStatus, lastSynced, syncProgress } = useStore();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyImages, setShowOnlyImages] = useState(true);
    const listRef = useRef<any>(null); // Using any to avoid TS issues with FlashList type

    const scrollToTop = () => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    };


    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (syncStatus === 'syncing') {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true
                })
            ).start();
        } else {
            spinValue.setValue(0);
        }
    }, [syncStatus]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const data = useMemo<ListItem[]>(() => {
        const listItems: ListItem[] = [];
        const query = searchQuery.toLowerCase().trim();

        // Helper to process a specific brand
        const processBrand = (brandName: string, brandObj?: Brand) => {
            const targetBrand = brandObj || brands.find(b => normalizeName(b.groupName) === normalizeName(brandName));
            if (!targetBrand) return;

            const brandMatches = targetBrand.groupName.toLowerCase().includes(query);
            let relevantProducts = targetBrand.products;

            if (query !== '') {
                // Search logic
                if (brandMatches) {
                    // Include all if brand matches
                } else {
                    // Filter by product name
                    relevantProducts = targetBrand.products.filter(p => p.productName.toLowerCase().includes(query));
                }
            }

            // Image Filter
            if (showOnlyImages) {
                relevantProducts = relevantProducts.filter(p => (p.localImagePath || p.imageUrl));
            }

            if (relevantProducts.length > 0) {
                // Push Brand Header
                listItems.push({ type: 'header', ...targetBrand });

                // Push Products if expanded
                if (targetBrand.isExpanded !== false || query !== '') { // Auto-expand on search
                    relevantProducts.forEach(p => {
                        listItems.push({ type: 'product', product: p, groupName: targetBrand.groupName });
                    });
                }
            }
        };

        // 1. CUBIX
        // Note: Check if "Cubix" exists in brands
        brands.filter(b => normalizeName(b.groupName).includes('cubix')).forEach(b => processBrand('', b));

        // 2. FLOREX
        brands.filter(b => normalizeName(b.groupName).includes('florex')).forEach(b => processBrand('', b));

        // 3. PARAGON GROUP
        const paragonBrands = PARAGON_SUBGROUPS.map(name => brands.find(b => normalizeName(b.groupName) === normalizeName(name))).filter(Boolean) as Brand[];

        const preParagonLen = listItems.length;
        listItems.push({ type: 'meta-header', title: 'PARAGON' });
        paragonBrands.forEach(b => processBrand('', b));

        if (listItems.length === preParagonLen + 1) {
            // No paragon brands added (or filtered out)
            listItems.pop();
        }

        // 4. GENERAL ITEMS GROUP
        const preGeneralLen = listItems.length;
        listItems.push({ type: 'meta-header', title: 'GENERAL ITEMS' });

        // Find brands that match the General list
        const generalBrands = GENERAL_ITEMS_SUBGROUPS.map(name => brands.find(b => normalizeName(b.groupName) === normalizeName(name))).filter(Boolean) as Brand[];

        const explicitGeneralNames = new Set(generalBrands.map(b => b.groupName));

        // Add distinct brands from 'brands' that match logic
        brands.forEach(b => {
            const name = normalizeName(b.groupName);
            if (explicitGeneralNames.has(b.groupName)) {
                processBrand('', b);
            } else {
                // Check if it was already handled by Cubix/Florex/Paragon
                const isCubix = name.includes('cubix');
                const isFlorex = name.includes('florex');
                const isParagon = PARAGON_SUBGROUPS.some(p => normalizeName(p) === name);

                if (!isCubix && !isFlorex && !isParagon) { // If not handled, put in General
                    processBrand('', b);
                }
            }
        });

        if (listItems.length === preGeneralLen + 1) {
            listItems.pop();
        }

        return listItems;
    }, [brands, searchQuery, showOnlyImages]);

    const renderItem = ({ item }: { item: ListItem }) => {
        if (item.type === 'meta-header') {
            return (
                <View style={styles.metaHeader}>
                    <Text style={styles.metaHeaderText}>{item.title}</Text>
                </View>
            );
        }

        if (item.type === 'header') {
            return (
                <TouchableOpacity
                    style={styles.brandHeader}
                    onPress={() => toggleBrandCollapse(item.groupName)}
                >
                    <View style={styles.brandHeaderContent}>
                        <Text style={styles.brandHeaderText}>{item.groupName}</Text>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{item.products ? item.products.length : 0}</Text>
                        </View>
                    </View>
                    <Icon name={item.isExpanded !== false ? "expand-less" : "expand-more"} size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            );
        }

        // Product Item
        const p: Product = item.product;
        // Use user preference for camel/title case
        const displayName = toTitleCase(p.productName);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { product: p, groupName: item.groupName })}
                activeOpacity={0.8}
            >
                <View style={styles.imageWrapper}>
                    <FastImage
                        style={styles.image}
                        source={{
                            uri: p.localImagePath || p.imageUrl || 'https://via.placeholder.com/300x400.png?text=No+Image',
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.productName} numberOfLines={2}>{displayName}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.qtyLabel}>Stock: <Text style={styles.qtyValue}>{p.quantity}</Text></Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            {/* Top Bar Area */}
            <View style={styles.headerContainer}>
                <View style={styles.topBar}>
                    <Text style={styles.appTitle}>e-sbe</Text>
                    <View style={styles.actionButtons}>
                        {lastSynced && (
                            <View style={{ marginRight: 8, justifyContent: 'center', alignItems: 'flex-end' }}>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Last Synced</Text>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                                    {new Date(lastSynced).toLocaleDateString()} {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        )}
                        {syncStatus === 'syncing' && (
                            <View style={{ marginRight: 8, justifyContent: 'center' }}>
                                <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: 'bold' }}>
                                    {syncProgress}%
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.iconButton} onPress={() => syncData()}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <Icon name="sync" size={20} color="#fff" />
                            </Animated.View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
                            <Icon name="shopping-cart" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.searchBarContainer}>
                    <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Products with images only</Text>
                    <Switch
                        value={showOnlyImages}
                        onValueChange={setShowOnlyImages}
                        trackColor={{ false: "#767577", true: theme.colors.accent }}
                        thumbColor={showOnlyImages ? "#fff" : "#f4f3f4"}
                    />
                </View>
            </View>

            <FlashList<ListItem>
                ref={listRef}
                data={data}
                renderItem={renderItem}
                // @ts-ignore
                estimatedItemSize={280}
                numColumns={2}
                getItemType={(item) => item.type}
                overrideItemLayout={(layout: any, item) => {
                    if (item.type === 'meta-header' || item.type === 'header') {
                        layout.span = 2;
                        layout.size = item.type === 'meta-header' ? 50 : 60; // Approximate height
                    } else {
                        layout.size = 280;
                    }
                }}
                contentContainerStyle={styles.listContent}
            />

            <TouchableOpacity style={styles.fab} onPress={scrollToTop}>
                <Icon name="keyboard-arrow-up" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    headerContainer: {
        backgroundColor: theme.colors.primary,
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 8,
        marginBottom: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'android' ? 'serif' : 'Georgia',
        fontStyle: 'italic'
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 10,
        borderRadius: 12,
        position: 'relative'
    },
    dot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.success
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 15,
    },
    filterLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 5,
    },
    // Meta Header
    metaHeader: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
        marginTop: 10,
    },
    metaHeaderText: {
        fontSize: 20,
        fontWeight: '900',
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        borderBottomWidth: 3,
        borderBottomColor: theme.colors.accent,
        alignSelf: 'flex-start',
        paddingBottom: 4,
    },
    // Brand Header
    brandHeader: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderLeftWidth: 5,
        borderLeftColor: theme.colors.secondary,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    brandHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandHeaderText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.secondary,
        marginRight: 8,
    },
    badgeContainer: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee'
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textSecondary
    },
    // Product Card
    card: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.m,
        margin: 6,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)'
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 3 / 4, // Portrait
        backgroundColor: '#f0f2f5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    cardContent: {
        padding: 10,
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 6,
        lineHeight: 18,
        height: 36, // Force 2 lines
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    qtyLabel: {
        fontSize: 12,
        color: '#636e72',
    },
    qtyValue: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 100,
    }
});

export default HomeScreen;
