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
import type {
  KpiIndicatorResponse,
  KpiIndicatorSingleResponse,
  KpiIndicatorCreateRequest,
  KpiIndicatorUpdateRequest,
  KpiResponse,
  KpiSingleResponse,
  KpiCreateRequest,
  KpiUpdateRequest,
  KpiDetailCreateRequest,
  KpiDetailUpdateRequest,
  KpiDetailSingleResponse,
} from '@/types/kpi';



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

// KPI Indicator API
export const kpiIndicatorAPI = {
  getAll: async (departemenId?: string): Promise<KpiIndicatorResponse> => {
    const params: Record<string, string> = {};
    if (departemenId) {
      params.departemenId = departemenId;
    }
    const response = await api.get<KpiIndicatorResponse>('/api/kpi/indicators', { params });
    return response.data;
  },

  getById: async (id: string): Promise<KpiIndicatorSingleResponse> => {
    const response = await api.get<KpiIndicatorSingleResponse>(`/api/kpi/indicators/${id}`);
    return response.data;
  },

  create: async (data: KpiIndicatorCreateRequest): Promise<KpiIndicatorSingleResponse> => {
    const response = await api.post<KpiIndicatorSingleResponse>('/api/kpi/indicators', data);
    return response.data;
  },

  update: async (id: string, data: KpiIndicatorUpdateRequest): Promise<KpiIndicatorSingleResponse> => {
    console.log('Updating KPI Indicator:', { id, data });
    const response = await api.put<KpiIndicatorSingleResponse>(`/api/kpi/indicators/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/kpi/indicators/${id}`);
    return response.data;
  },
};

// KPI Query Parameters Interface
interface KpiQueryParams {
  year?: number;
  karyawanId?: string;
}

// KPI API
export const kpiAPI = {
  getAll: async (year?: number, karyawanId?: string): Promise<KpiResponse> => {
    const params: KpiQueryParams = {};
    if (year !== undefined) {
      params.year = year;
    }
    if (karyawanId !== undefined) {
      params.karyawanId = karyawanId;
    }
    
    const response = await api.get<KpiResponse>('/api/kpi/kpi', { params });
    return response.data;
  },

  getById: async (id: string): Promise<KpiSingleResponse> => {
    const response = await api.get<KpiSingleResponse>(`/api/kpi/kpi/${id}`);
    return response.data;
  },

  create: async (data: KpiCreateRequest): Promise<KpiSingleResponse> => {
    const response = await api.post<KpiSingleResponse>('/api/kpi/kpi', data);
    return response.data;
  },

  update: async (id: string, data: KpiUpdateRequest): Promise<KpiSingleResponse> => {
    console.log('Updating KPI:', { id, data });
    const response = await api.put<KpiSingleResponse>(`/api/kpi/kpi/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/kpi/kpi/${id}`);
    return response.data;
  },

  getMyKpi: async (): Promise<KpiResponse> => {
    const response = await api.get<KpiResponse>('/api/kpi/my-kpi');
    return response.data;
  },

  // KPI Detail endpoints
  addDetail: async (kpiId: string, data: KpiDetailCreateRequest): Promise<KpiDetailSingleResponse> => {
    const response = await api.post<KpiDetailSingleResponse>(`/api/kpi/kpi/${kpiId}/details`, data);
    return response.data;
  },

  updateDetail: async (detailId: string, data: KpiDetailUpdateRequest): Promise<KpiDetailSingleResponse> => {
    const response = await api.put<KpiDetailSingleResponse>(`/api/kpi/kpi/details/${detailId}`, data);
    return response.data;
  },

  deleteDetail: async (detailId: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/kpi/kpi/details/${detailId}`);
    return response.data;
  },
};
export default api;