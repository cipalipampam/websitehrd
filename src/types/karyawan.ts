export interface Karyawan {
  id: string;
  userId: string;
  nama: string;
  gender: string;
  alamat: string;
  no_telp: string;
  tanggal_lahir: string;
  pendidikan: string;
  tanggal_masuk: string;
  jalur_rekrut: string;
  departemenId?: string | null;
  jabatanId?: string | null;
  umur?: number | null;
  masaKerja?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Relations
  departemen?: Array<{
    id: string;
    nama: string;
  }>;
  jabatan?: Array<{
    id: string;
    nama: string;
  }>;
  user?: {
    username: string;
    email: string;
    role: string;
  };
}

export interface KaryawanResponse {
  status: number;
  message: string;
  data: Karyawan[];
}

export interface KaryawanSingleResponse {
  status: number;
  message: string;
  data: Karyawan;
}

export interface KaryawanCreateRequest {
  username: string;
  email: string;
  password: string;
  nama: string;
  gender: string;
  alamat: string;
  no_telp: string;
  tanggal_lahir: string;
  pendidikan: string;
  tanggal_masuk: string;
  jalur_rekrut: string;
  departemenId?: string;
  jabatanId?: string;
}

export interface KaryawanUpdateRequest {
  nama?: string;
  gender?: string;
  alamat?: string;
  no_telp?: string;
  tanggal_lahir?: string;
  pendidikan?: string;
  tanggal_masuk?: string;
  jalur_rekrut?: string;
  departemenId?: string | null;
  jabatanId?: string | null;
}