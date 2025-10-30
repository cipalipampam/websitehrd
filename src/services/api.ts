import axios, { AxiosError } from 'axios';
import type { LoginRequest, LoginResponse, UserResponse } from '../types/auth';
import type { 
  DepartemenResponse, 
  DepartemenCreateRequest, 
  DepartemenUpdateRequest,
  DepartemenSingleResponse 
} from '../types/departemen';
import type { JabatanCreateRequest, JabatanResponse, JabatanSingleResponse, JabatanUpdateRequest } from '@/types/jabatan';
import type { KaryawanCreateRequest, KaryawanResponse, KaryawanSingleResponse, KaryawanUpdateRequest } from '@/types/karyawan';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request untuk debugging
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    fullURL: `${config.baseURL}${config.url}`,
    data: config.data,
    headers: config.headers
  });
  
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => {
    // Log response untuk debugging
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error: AxiosError) => {
    // Log error untuk debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  },
  
  getMe: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/api/auth/me');
    return response.data;
  },
};

export const departemenAPI = {
  getAll: async (): Promise<DepartemenResponse> => {
    const response = await api.get<DepartemenResponse>('/api/departemen');
    return response.data;
  },

  create: async (data: DepartemenCreateRequest): Promise<DepartemenSingleResponse> => {
    const response = await api.post<DepartemenSingleResponse>('/api/departemen', data);
    return response.data;
  },

  update: async (id: string, data: DepartemenUpdateRequest): Promise<DepartemenSingleResponse> => {
    console.log('Updating departemen:', { id, data }); // Log tambahan
    const response = await api.put<DepartemenSingleResponse>(`/api/departemen/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/departemen/${id}`);
    return response.data;
  },
};

export const jabatanAPI = {
  getAll: async (): Promise<JabatanResponse> => {
    const response = await api.get<JabatanResponse>('/api/jabatan');
    return response.data;
  },

  create: async (data: JabatanCreateRequest): Promise<JabatanSingleResponse> => {
    const response = await api.post<JabatanSingleResponse>('/api/jabatan', data);
    return response.data;
  },

  update: async (id: string, data: JabatanUpdateRequest): Promise<JabatanSingleResponse> => {
    console.log('Updating Jabatan:', { id, data }); // Log tambahan
    const response = await api.put<JabatanSingleResponse>(`/api/jabatan/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/jabatan/${id}`);
    return response.data;
  },
};

export const karyawanAPI = {
  getAll: async (): Promise<KaryawanResponse> => {
    const response = await api.get<KaryawanResponse>('/api/karyawan');
    return response.data;
  },

  getById: async (id: string): Promise<KaryawanSingleResponse> => {
    const response = await api.get<KaryawanSingleResponse>(`/api/karyawan/${id}`);
    return response.data;
  },

  create: async (data: KaryawanCreateRequest): Promise<KaryawanSingleResponse> => {
    const response = await api.post<KaryawanSingleResponse>('/api/karyawan', data);
    return response.data;
  },

  update: async (id: string, data: KaryawanUpdateRequest): Promise<KaryawanSingleResponse> => {
    console.log('Updating Karyawan:', { id, data });
    const response = await api.put<KaryawanSingleResponse>(`/api/karyawan/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/karyawan/${id}`);
    return response.data;
  },
};

export default api;