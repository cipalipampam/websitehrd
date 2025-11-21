export interface Penghargaan {
  id: string;
  nama: string;
  tahun: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Relations
  karyawan?: Array<{
    id: string;
    nama: string;
    departemen?: {
      id: string;
      nama: string;
    };
    jabatan?: {
      id: string;
      nama: string;
    };
  }>;
}

export interface PenghargaanResponse {
  status: number;
  message: string;
  data: Penghargaan[];
}

export interface PenghargaanSingleResponse {
  status: number;
  message: string;
  data: Penghargaan;
}

export interface PenghargaanCreateRequest {
  nama: string;
  tahun: string;
  karyawanIds?: string[];
}

export interface PenghargaanUpdateRequest {
  nama?: string;
  tahun?: string;
  karyawanIds?: string[];
}