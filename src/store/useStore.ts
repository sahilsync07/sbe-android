import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
    productName: string;
    quantity: number;
    rate: number;
    amount: number;
    imageUrl: string | null;
    localImagePath?: string | null;
}

export interface Brand {
    groupName: string;
    products: Product[];
    totalAmount: number;
    isExpanded?: boolean; // For UI
}

export interface CartItem {
    id: string; // Unique ID (e.g. productName)
    product: Product;
    selection: string; // "1 Set", "2 Sets", "3 Sets", or Custom Note
}

interface StoreState {
    brands: Brand[];
    cart: CartItem[];
    lastSynced: string | null;
    syncStatus: 'idle' | 'syncing' | 'success' | 'error';
    setBrands: (brands: Brand[]) => void;
    toggleBrandCollapse: (groupName: string) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => void;
    setLastSynced: (date: string) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            brands: [],
            cart: [],
            lastSynced: null,
            syncStatus: 'idle',
            setBrands: (brands) => set({ brands }),
            toggleBrandCollapse: (groupName) =>
                set((state) => ({
                    brands: state.brands.map((b) =>
                        b.groupName === groupName ? { ...b, isExpanded: !b.isExpanded } : b
                    ),
                })),
            addToCart: (item) =>
                set((state) => {
                    const existing = state.cart.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            cart: state.cart.map((i) => (i.id === item.id ? item : i)),
                        };
                    }
                    return { cart: [...state.cart, item] };
                }),
            removeFromCart: (id) =>
                set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
            setSyncStatus: (status) => set({ syncStatus: status }),
            setLastSynced: (date) => set({ lastSynced: date }),
        }),
        {
            name: 'sbe-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
