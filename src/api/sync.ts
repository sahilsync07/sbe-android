import { useStore, Brand, Product } from '../store/useStore';
import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid } from 'react-native';

const DATA_URL = 'https://raw.githubusercontent.com/sahilsync07/sbe/main/frontend/src/assets/stock-data.json';

export const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        try {
            if (Platform.Version >= 33) {
                const grants = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );
                if (grants === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Permissions granted (Android 13+)');
                    return true;
                } else {
                    console.log('Permissions denied (Android 13+)');
                    return false;
                }
            } else {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);

                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Permissions granted');
                    return true;
                } else {
                    console.log('Permissions denied');
                    return false;
                }
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
};

const getLocalImagePath = (groupName: string, fileName: string) => {
    // Sanitize groupName for folder usage
    const safeGroupName = groupName.replace(/[^a-zA-Z0-9]/g, '_');
    // Use Pictures directory which shows in Gallery
    const dirPath = `${RNFS.PicturesDirectoryPath}/SBE_App/${safeGroupName}`;
    const filePath = `${dirPath}/${fileName}`;
    return { dirPath, filePath };
};

export const syncData = async () => {
    const store = useStore.getState();
    store.setSyncStatus('syncing');

    try {
        const hasPerm = await requestPermissions();
        if (!hasPerm) {
            console.log("Permission denied, image download might fail");
            // Continue anyway for data
        }

        const response = await fetch(DATA_URL);
        const remoteData: Brand[] = await response.json();

        // Calculate total items for progress
        // Each brand is 1 unit, each product image download/check is 1 unit? 
        // Or just count brands? Brands + Products is safer for granularity.
        let totalItems = remoteData.length;
        remoteData.forEach(b => totalItems += b.products.length);
        let processedItems = 0;

        const updateProgress = () => {
            processedItems++;
            const progress = Math.min(Math.round((processedItems / totalItems) * 100), 100);
            store.setSyncProgress(progress);
        };

        const currentBrands = store.brands;
        const newBrands: Brand[] = [];

        for (const remoteBrand of remoteData) {
            updateProgress(); // Brand processed (start)
            // Find existing brand to preserve local state if needed (like expanded)
            // or just overwrite. User said "delta operations... remove deleted, add added".
            // We'll perform a smart merge.

            const existingBrand = currentBrands.find(b => b.groupName === remoteBrand.groupName);

            const newProducts: Product[] = [];

            for (const p of remoteBrand.products) {
                // Check image
                let localPath = null;
                if (p.imageUrl) {
                    // Extract filename from URL
                    const fileName = p.imageUrl.split('/').pop();
                    if (fileName) {
                        const { dirPath, filePath } = getLocalImagePath(remoteBrand.groupName, fileName);

                        // Check if file exists
                        const exists = await RNFS.exists(filePath);
                        if (exists) {
                            localPath = 'file://' + filePath;
                        } else {
                            // Download
                            try {
                                await RNFS.mkdir(dirPath); // Ensure specific brand folder exists
                                await RNFS.downloadFile({
                                    fromUrl: p.imageUrl,
                                    toFile: filePath,
                                }).promise;
                                localPath = 'file://' + filePath;
                            } catch (err) {
                                console.error("Download failed for", p.imageUrl, err);
                            }
                        }
                    }
                }

                newProducts.push({
                    ...p,
                    localImagePath: localPath
                });
                updateProgress(); // Product processed
            }

            newBrands.push({
                ...remoteBrand,
                products: newProducts,
                isExpanded: existingBrand ? existingBrand.isExpanded : true // Default expanded? User said "collapsable". Defaults to expanded usually or collapsed? "tapping ... should be collapsable", implies it starts expanded or collapsed. Let's default true.
            });
        }

        store.setBrands(newBrands);
        store.setLastSynced(new Date().toISOString());
        store.setSyncStatus('success');
        store.setSyncProgress(100); setTimeout(() => store.setSyncProgress(0), 2000);

    } catch (error) {
        console.error('Sync failed', error);
        store.setSyncStatus('error');
    }
};
