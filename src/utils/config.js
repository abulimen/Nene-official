// Get the base URL for the backend API
export const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Get the base URL for uploads
// Uses dedicated VITE_UPLOADS_URL if set, otherwise derives from API URL
export const getUploadsBaseUrl = () => {
    // Check for dedicated uploads URL first
    if (import.meta.env.VITE_UPLOADS_URL) {
        return import.meta.env.VITE_UPLOADS_URL;
    }
    // Fall back to deriving from API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
};

// Helper to get full upload URL
export const getUploadUrl = (filename) => {
    if (!filename) return null;
    // Already a full URL
    if (filename.startsWith('http')) return filename;
    // Remove leading slash if present to avoid double slashes
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    // Check if filename already includes 'uploads/'
    if (cleanFilename.startsWith('uploads/')) {
        return `${getUploadsBaseUrl()}/${cleanFilename}`;
    }
    return `${getUploadsBaseUrl()}/uploads/${cleanFilename}`;
};
