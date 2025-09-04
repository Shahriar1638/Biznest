import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

// Custom hook for fetching all products
export const useProducts = (category = 'all') => {
    const axiosPublic = useAxiosPublic();

    return useQuery({
        queryKey: ['products', category],
        queryFn: async () => {
            let endpoint = '/products/allproducts';
            
            if (category === 'all') {
                endpoint = '/products/allproducts';
            } else {
                endpoint = `/products/${encodeURIComponent(category)}`;
            }
            
            const response = await axiosPublic.get(endpoint);
            return response.data || [];
        },
        staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
        cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
        retry: 2, // Retry failed requests 2 times
        refetchOnWindowFocus: false, // Don't refetch on window focus
        onError: (error) => {
            console.error('Error fetching products:', error);
        }
    });
};

// Custom hook for fetching trending products
export const useTrendingProducts = () => {
    const axiosPublic = useAxiosPublic();

    return useQuery({
        queryKey: ['products', 'trending'],
        queryFn: async () => {
            const response = await axiosPublic.get('/products/trending');
            return response.data || [];
        },
        staleTime: 3 * 60 * 1000, // Trending data stays fresh for 3 minutes
        cacheTime: 8 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false
    });
};

// Custom hook for fetching featured products
export const useFeaturedProducts = () => {
    const axiosPublic = useAxiosPublic();

    return useQuery({
        queryKey: ['products', 'featured'],
        queryFn: async () => {
            const response = await axiosPublic.get('/products/featured');
            return response.data || [];
        },
        staleTime: 10 * 60 * 1000, // Featured products stay fresh longer
        cacheTime: 15 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false
    });
};

// Custom hook for fetching user's wishlist
export const useWishlist = () => {
    const axiosPublic = useAxiosPublic();

    return useQuery({
        queryKey: ['user', 'wishlist'],
        queryFn: async () => {
            const response = await axiosPublic.get('/user/wishlist');
            return response.data || [];
        },
        staleTime: 2 * 60 * 1000,
        cacheTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true // Refetch wishlist when user returns to tab
    });
};
