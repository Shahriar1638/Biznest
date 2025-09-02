import axios from "axios";

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
})
const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;