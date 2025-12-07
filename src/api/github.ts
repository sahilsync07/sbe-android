import { Buffer } from 'buffer';
import { Brand } from '../store/useStore';

const GITHUB_TOKEN = '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';
const REPO_OWNER = 'sahilsync07';
const REPO_NAME = 'sbe';
const FILE_PATH = 'frontend/src/assets/stock-data.json';
const BRANCH = 'main';

const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

interface GitHubFileResponse {
    sha: string;
    content: string;
    encoding: string;
}

export const updateProductImageInGitHub = async (productName: string, newImageUrl: string | null) => {
    try {
        // 1. Get current file content and SHA
        const getResponse = await fetch(API_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!getResponse.ok) {
            throw new Error(`Failed to fetch file from GitHub: ${getResponse.statusText}`);
        }

        const fileData: GitHubFileResponse = await getResponse.json();

        // 2. Decode content
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        let stockData: Brand[] = JSON.parse(currentContent);

        // 3. Modify JSON
        let updated = false;
        stockData = stockData.map(group => ({
            ...group,
            products: group.products.map(product => {
                if (product.productName === productName) {
                    updated = true;
                    return { ...product, imageUrl: newImageUrl };
                }
                return product;
            })
        }));

        if (!updated) {
            throw new Error(`Product "${productName}" not found in remote JSON.`);
        }

        // 4. Encode content
        const newContent = Buffer.from(JSON.stringify(stockData, null, 2)).toString('base64');

        // 5. Commit changes
        const putResponse = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Update image for ${productName} (via Android App)`,
                content: newContent,
                sha: fileData.sha,
                branch: BRANCH,
            }),
        });

        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            throw new Error(`Failed to commit to GitHub: ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error('GitHub Sync Error:', error);
        throw error;
    }
};
