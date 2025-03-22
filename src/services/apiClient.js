import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Initialize auth token from environment variable
if (import.meta.env.VITE_API_TOKEN) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${import.meta.env.VITE_API_TOKEN}`;
}

const apiClient = {
    // Get directories (dates)
    getDirectories: async () => {
        const response = await axios.get(`${API_BASE_URL}/directories`);
        return response.data;
    },

    // Get image groups with optional directory and search filters
    getImageGroups: async (directory = '', search = '') => {
        const response = await axios.get(`${API_BASE_URL}/entries`, {
            params: { directory, search }
        });
        return response.data;
    },

    // Get single entry details
    getEntryDetails: async (entryId) => {
        const response = await axios.get(`${API_BASE_URL}/entries/${entryId}`);
        return response.data;
    }
};

export default apiClient; 