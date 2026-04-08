import axios from 'axios'
import { getToken, removeToken } from '../utils/token'

const axiosInstance = axios.create({
  baseURL: '/api/v1',
})

axiosInstance.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/'
    }

    return Promise.reject(error)
  }
)

export const registerUser = async (data) => {
  const response = await axiosInstance.post('/auth/register', data)
  return response.data
}

export const loginUser = async (data) => {
  const response = await axiosInstance.post('/auth/login', data)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me')
  return response.data
}

export const submitAccessRequest = async (data) => {
  const response = await axiosInstance.post('/auth/request-access', data)
  return response.data
}

export const updateCurrentUserProfile = async (data) => {
  const response = await axiosInstance.patch('/auth/profile', data)
  return response.data
}

export const getAllUsers = async () => {
  const response = await axiosInstance.get('/auth/users')
  return response.data
}

export const createManagedUser = async (data) => {
  const response = await axiosInstance.post('/auth/users', data)
  return response.data
}

export const updateUserRole = async (userId, data) => {
  const response = await axiosInstance.patch(`/auth/users/${userId}/role`, data)
  return response.data
}

export const updateApprovalStatus = async (userId, data) => {
  const response = await axiosInstance.patch(`/auth/users/${userId}/approval`, data)
  return response.data
}

export const updateUserStatus = async (userId, data) => {
  const response = await axiosInstance.patch(`/auth/users/${userId}/status`, data)
  return response.data
}

export default axiosInstance
