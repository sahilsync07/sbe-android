export const uploadToCloudinary = async (fileUri: string): Promise<string> => {
    const data = new FormData();
    const timestamp = new Date().getTime();
    data.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: `sbe_upload_${timestamp}_${Math.random().toString(36).substr(2, 5)}.jpg`,
    });
    data.append('upload_preset', 'sbe-stock');

    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dg365ewal/image/upload', {
            method: 'POST',
            body: data,
        });

        const json = await response.json();
        if (json.secure_url) {
            return json.secure_url;
        } else {
            throw new Error(json.error?.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};
