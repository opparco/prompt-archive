import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Initialize auth token from environment variable
if (import.meta.env.VITE_API_TOKEN) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${import.meta.env.VITE_API_TOKEN}`;
}

// Add response interceptor for error handling
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED' || !error.response) {
            // Handle network errors or timeout
            console.error('API connection error:', error.message);
            // You can trigger a global error event or state update here
            return Promise.reject(new Error('API connection error occurred'));
        }
        return Promise.reject(error);
    }
);

const apiClient = {
    // Get directories (dates)
    getDirectories: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/directories`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch directories:', error);
            throw error;
        }
    },

    // Get image groups with optional directory and search filters
    getImageGroups: async (directory = '', search = '') => {
        try {
            const response = await axios.get(`${API_BASE_URL}/entries`, {
                params: { directory, search }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch image groups:', error);
            throw error;
        }
    },

    // Get single entry details
    getEntryDetails: async (entryId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/entries/${entryId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch entry details:', error);
            throw error;
        }
    }
};

export default apiClient; 