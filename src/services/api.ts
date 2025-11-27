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
import type {
  PenghargaanResponse,
  PenghargaanSingleResponse,
  PenghargaanCreateRequest,
  PenghargaanUpdateRequest,
} from '@/types/perhargaan';
import type {
  PredictInput,
  PredictResponse,
  KaryawanPredictResponse,
  BatchPredictResponse,
} from '@/types/predict';
import type {
  KehadiranResponse,
  KehadiranSingleResponse,
  KehadiranHistoryResponse,
  KehadiranSummaryResponse,
  CheckInRequest,
  CheckOutRequest,
  KehadiranCreateRequest,
  KehadiranUpdateRequest,
} from '@/types/kehadiran';
import type {
  IzinRequestResponse,
  IzinRequestSingleResponse,
} from '@/types/izin';




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

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ status: number; message: string }> => {
    const response = await api.post<{ status: number; message: string }>('/api/auth/change-password', data);
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
  getAll: async (params?: { departemenId?: string }): Promise<JabatanResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.departemenId) {
      queryParams.departemenId = params.departemenId;
    }
    const response = await api.get<JabatanResponse>('/api/jabatan', { params: queryParams });
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

  getMyProfile: async (): Promise<KaryawanSingleResponse> => {
    const response = await api.get<KaryawanSingleResponse>('/api/karyawan/me');
    return response.data;
  },

  updateProfile: async (data: Partial<KaryawanUpdateRequest>): Promise<KaryawanSingleResponse> => {
    console.log('Updating Profile:', { data });
    const response = await api.put<KaryawanSingleResponse>('/api/karyawan/me', data);
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

export const penghargaanAPI = {
  getAll: async (): Promise<PenghargaanResponse> => {
    const response = await api.get<PenghargaanResponse>('/api/penghargaan');
    return response.data;
  },

  getById: async (id: string): Promise<PenghargaanSingleResponse> => {
    const response = await api.get<PenghargaanSingleResponse>(`/api/penghargaan/${id}`);
    return response.data;
  },

  getByKaryawan: async (karyawanId: string): Promise<PenghargaanResponse> => {
    const response = await api.get<PenghargaanResponse>(`/api/penghargaan/karyawan/${karyawanId}`);
    return response.data;
  },

  create: async (data: PenghargaanCreateRequest): Promise<PenghargaanSingleResponse> => {
    const response = await api.post<PenghargaanSingleResponse>('/api/penghargaan', data);
    return response.data;
  },

  update: async (id: string, data: PenghargaanUpdateRequest): Promise<PenghargaanSingleResponse> => {
    console.log('Updating Penghargaan:', { id, data });
    const response = await api.put<PenghargaanSingleResponse>(`/api/penghargaan/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/penghargaan/${id}`);
    return response.data;
  },
};

export const predictAPI = {
  // Prediksi manual dengan input form
  predict: async (data: PredictInput): Promise<PredictResponse> => {
    const response = await api.post<PredictResponse>('/api/predict', data);
    return response.data;
  },

  // Prediksi untuk karyawan tertentu
  predictKaryawan: async (
    id: string,
    year: number
  ): Promise<KaryawanPredictResponse> => {
    const response = await api.post<KaryawanPredictResponse>(
      `/api/predict/karyawan/${id}`,
      { year }
    );
    return response.data;
  },

  // Prediksi batch untuk semua karyawan
  predictBatch: async (
    year: number,
    filter?: 'promosi' | 'tidak_promosi'
  ): Promise<BatchPredictResponse> => {
    const response = await api.post<BatchPredictResponse>('/api/predict/batch', {
      year,
      filter,
    });
    return response.data;
  },
};

export default api;

export const pelatihanAPI = {
  // HR: get all pelatihan
  getAll: async () => {
    const response = await api.get('/api/pelatihan');
    return response.data;
  },

  // HR: get pelatihan by ID with participants
  getById: async (id: string) => {
    const response = await api.get(`/api/pelatihan/${id}`);
    return response.data;
  },

  // Authenticated users: get available pelatihan
  getAvailable: async () => {
    const response = await api.get('/api/pelatihan/available');
    return response.data;
  },

  // Get my joined pelatihan
  getMy: async () => {
    const response = await api.get('/api/pelatihan/my');
    return response.data;
  },

  create: async (data: { nama: string; tanggal: string; lokasi: string }) => {
    const response = await api.post('/api/pelatihan', data);
    return response.data;
  },

  join: async (id: string) => {
    const response = await api.post(`/api/pelatihan/${id}/join`);
    return response.data;
  },

  confirm: async (id: string) => {
    const response = await api.post(`/api/pelatihan/${id}/confirm`);
    return response.data;
  },

  decline: async (id: string, alasan?: string) => {
    const response = await api.post(`/api/pelatihan/${id}/decline`, { alasan });
    return response.data;
  },

  // HR: update participant score
  updateScore: async (pelatihanId: string, karyawanId: string, data: { skor: number; catatan?: string }) => {
    const response = await api.put(`/api/pelatihan/${pelatihanId}/participant/${karyawanId}/score`, data);
    return response.data;
  }
};

export const kehadiranAPI = {
  // Check-in (untuk karyawan yang login)
  checkIn: async (data: CheckInRequest): Promise<KehadiranSingleResponse> => {
    const response = await api.post<KehadiranSingleResponse>('/api/kehadiran/check-in', data);
    return response.data;
  },

  // Check-out (untuk karyawan yang login)
  checkOut: async (data?: CheckOutRequest): Promise<KehadiranSingleResponse> => {
    const response = await api.post<KehadiranSingleResponse>('/api/kehadiran/check-out', data || {});
    return response.data;
  },

  // Get kehadiran hari ini untuk user yang login
  getToday: async (): Promise<KehadiranSingleResponse> => {
    const response = await api.get<KehadiranSingleResponse>('/api/kehadiran/today');
    return response.data;
  },

  // Get riwayat kehadiran user yang login
  getHistory: async (params?: { month?: number; year?: number }): Promise<KehadiranHistoryResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.month !== undefined) queryParams.append('month', params.month.toString());
    if (params?.year !== undefined) queryParams.append('year', params.year.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/api/kehadiran/history${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<KehadiranHistoryResponse>(endpoint);
    return response.data;
  },

  // Get all kehadiran (HR only)
  getAll: async (params?: { 
    karyawanId?: string; 
    month?: number; 
    year?: number; 
    status?: string;
  }): Promise<KehadiranResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.karyawanId) queryParams.append('karyawanId', params.karyawanId);
    if (params?.month !== undefined) queryParams.append('month', params.month.toString());
    if (params?.year !== undefined) queryParams.append('year', params.year.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/kehadiran${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<KehadiranResponse>(endpoint);
    return response.data;
  },

  // Get laporan summary (HR only)
  getSummary: async (params?: { 
    month?: number; 
    year?: number; 
  }): Promise<KehadiranSummaryResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.month !== undefined) queryParams.append('month', params.month.toString());
    if (params?.year !== undefined) queryParams.append('year', params.year.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/api/kehadiran/report/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<KehadiranSummaryResponse>(endpoint);
    return response.data;
  },

  // Create kehadiran manual (HR only)
  create: async (data: KehadiranCreateRequest): Promise<KehadiranSingleResponse> => {
    const response = await api.post<KehadiranSingleResponse>('/api/kehadiran', data);
    return response.data;
  },

  // Update kehadiran (HR only)
  update: async (id: string, data: KehadiranUpdateRequest): Promise<KehadiranSingleResponse> => {
    const response = await api.put<KehadiranSingleResponse>(`/api/kehadiran/${id}`, data);
    return response.data;
  },

  // Delete kehadiran (HR only)
  delete: async (id: string): Promise<{ status: number; message: string }> => {
    const response = await api.delete<{ status: number; message: string }>(`/api/kehadiran/${id}`);
    return response.data;
  },
};

export const izinAPI = {
  // Get all izin requests (HR only)
  getAll: async (params?: { status?: string }): Promise<IzinRequestResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/kehadiran/requests${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<IzinRequestResponse>(endpoint);
    return response.data;
  },

  // Approve izin request (HR only)
  approve: async (id: string): Promise<IzinRequestSingleResponse> => {
    const response = await api.put<IzinRequestSingleResponse>(`/api/kehadiran/requests/${id}/approve`);
    return response.data;
  },

  // Reject izin request (HR only)
  reject: async (id: string): Promise<IzinRequestSingleResponse> => {
    const response = await api.put<IzinRequestSingleResponse>(`/api/kehadiran/requests/${id}/reject`);
    return response.data;
  },
};