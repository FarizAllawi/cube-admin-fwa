import axios from 'axios'
import errorHandler from '../errorHandler'

const instance = axios.create({
    baseURL: `/api/`,
    // withCredentials: true
})

instance.interceptors.response.use((response) => response.data, errorHandler)
export default instance
