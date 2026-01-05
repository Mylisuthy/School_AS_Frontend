import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = 'An unexpected error occurred';
        if (error.response) {
            // Server responded with a status code outside 2xx
            if (error.response.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                } else if (error.response.data.errors) {
                    // Validation errors (e.g., from ASP.NET Core Identity)
                    // If it's an array or object
                    const errors = error.response.data.errors;
                    if (Array.isArray(errors)) { // Simple array of errors
                        message = errors.map(e => e.description || e).join(', ');
                    } else if (typeof errors === 'object') { // Obj of field errors
                        message = Object.values(errors).flat().join(', ');
                    }
                } else if (error.response.data.title) {
                    message = error.response.data.title;
                }
            } else {
                message = `Error ${error.response.status}: ${error.response.statusText}`;
            }
        } else if (error.request) {
            // Request made but no response received
            message = 'No response from server. Check your connection.';
        } else {
            // Error setting up request
            message = error.message;
        }

        // Attach formatted message to error object for easy access in components
        error.formattedMessage = message;

        if (error.response && error.response.status === 401) {
            // Auto-logout on 401
            localStorage.removeItem('token');
            // Optional: Redirect to login.
            // Since we use React Router, we can't easily use navigate hook outside component
            // But we can use window.location as a fallback or custom event.
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
