import api from "./axios"

export const getCategories = async () => {
    const categories = await api.get('/api/categories');
    return categories.data;
}