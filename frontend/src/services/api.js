import axios from 'axios';

const API = axios.create({
    baseURL: 'https://fittrack-pro-ffw1.onrender.com/api',
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

export default API;
