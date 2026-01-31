const API_URL = 'http://localhost:5000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    console.log(`[API Request] ${endpoint}`, options);
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    console.log(`[API Response] ${endpoint} status: ${res.status}`);

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Something went wrong' }));
        throw new Error(error.message || 'API Error');
    }

    return res.json();
};
