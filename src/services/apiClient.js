import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = {
    // ディレクトリ一覧の取得
    getDirectories: async () => {
        const response = await axios.get(`${API_BASE_URL}/directories`);
        return response.data;
    },

    // 画像グループの取得
    getImageGroups: async (directory, search = '') => {
        const response = await axios.get(`${API_BASE_URL}/groups`, {
            params: { directory, search }
        });
        return response.data;
    },

    // メタデータの取得
    getMetadata: async (path, directory) => {
        const response = await axios.get(`${API_BASE_URL}/metadata/${path}`, {
            params: { directory }
        });
        return response.data;
    },

    // 画像URLの生成
    getImageUrl: (directory, filename) => {
        return `${API_BASE_URL}/images/${directory}/${filename}`;
    }
};

export default apiClient; 