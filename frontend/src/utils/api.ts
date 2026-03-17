const  BASE_URL= "http://localhost:5000/api";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
    // Get the token from localStorage (or any other storage mechanism you use)
    const token = localStorage.getItem('token'); // Assuming you store the token in localStorage

    // Set up headers, including the Authorization header if the token exists
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        // Make the API request with the appropriate headers
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        }); 

        // Parse the JSON response
        const data = await response.json();

        // Check if the response is not OK (status code outside the range of 200-299)
        if (!response.ok) {
            throw new Error(data.message || 'An error occurred while fetching data');
        }

        return data;
    
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};