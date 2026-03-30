import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useAuth from "./useAuth";

// 1. Hook for User Contact Messages
export const useContacts = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["contacts", user?.email],
    queryFn: async () => {
      const response = await axiosSecure.get("/public/my-contacts");
      return response.data.data || [];
    },
    enabled: !loading && !!user?.email && user?.role?.type !== "admin",
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 30000, // Replaces manual setInterval polling
    refetchIntervalInBackground: false,
  });
};

// 2. Hook for Admin Global Contacts
export const useAdminContacts = (statusFilter = "all") => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["adminContacts", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const endpoint = params.toString()
        ? `/admin/contacts?${params.toString()}`
        : "/admin/contacts";
      const response = await axiosSecure.get(endpoint);
      // Handling both formats for robust compatability
      return response.data.contacts || response.data.data || [];
    },
    enabled: !loading && user?.role?.type === "admin",
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 30000, // Replaces manual setInterval polling
    refetchIntervalInBackground: false,
  });
};

// 3. Hook for Seller Products
export const useSellerProducts = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["sellerProducts", user?.email],
    queryFn: async () => {
      const response = await axiosSecure.get("/seller/my-products");
      return response.data; // Matches original Myproducts.jsx logic
    },
    enabled: !loading && user?.role?.type === "seller",
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// 4. Hook for Admin Global Products
export const useAdminProducts = (statusFilter = "all") => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["adminProducts", statusFilter],
    queryFn: async () => {
      const endpoint =
        statusFilter && statusFilter !== "all"
          ? `/admin/products?status=${statusFilter}`
          : "/admin/products";
      const response = await axiosSecure.get(endpoint);
      return { products: response.data, count: response.data.length }; // Matches original Admin Products logic
    },
    enabled: !loading && user?.role?.type === "admin",
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// 5. Hook for User Cart
export const useCart = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["userCart", user?.email],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/user/cart");
        return response.data.userCart; // Matches original ShowCart.jsx logic
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !loading && !!user?.email,
    staleTime: 1,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// 6. Hook for User Payment History
export const usePaymentHistory = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["paymentHistory", user?.email],
    queryFn: async () => {
      const response = await axiosSecure.get(`/user/payment-history`);
      return response.data.payments || []; // Matches original PaymentHistory.jsx logic
    },
    enabled: !loading && !!user?.email,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
