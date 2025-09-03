import axios from "axios";

// Get the API base URL from environment variables
const apiBaseURL = import.meta.env.VITE_API_BASE_URL;

const axiosPublic = axios.create({
    baseURL: apiBaseURL
});

console.log('Axios Public Base URL:', axiosPublic.defaults.baseURL);
const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;