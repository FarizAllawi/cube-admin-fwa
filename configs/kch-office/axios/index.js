import axios from 'axios'
import errorHandler from '../../errorHandler'

const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_KCH_OFFICE_SERVICE}`,
    headers: {
        'Access-Control-Allow-Origin' : `${process.env.NEXT_PUBLIC_KCH_OFFICE_SERVICE}`,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With' : 'XMLHttpRequest',
        'ApiKey' : `${process.env.NEXT_PUBLIC_KCH_OFFICE_API_KEY}`,
    },
    // withCredentials: true
})

instance.interceptors.response.use((response) => response.data, errorHandler)
export default instance
