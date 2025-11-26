export type KehadiranStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA' | 'BELUM_ABSEN';

export interface Kehadiran {
  id: string;
  karyawanId: string;
  tanggal: string;
  waktuMasuk: string | null;
  waktuKeluar: string | null;
  status: KehadiranStatus;
  lokasi: string | null;
  keterangan: string | null;
  createdAt: string;
  updatedAt: string;
  karyawan?: {
    id: string;
    nama: string;
    departemen?: Array<{ id: string; nama: string }>;
    jabatan?: Array<{ id: string; nama: string }>;
  };
}

export interface KehadiranStats {
  total: number;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpa: number;
  belumAbsen: number;
}

export interface KehadiranHistoryResponse {
  status: number;
  message: string;
  data: Kehadiran[];
  stats: KehadiranStats;
}

export interface KehadiranResponse {
  status: number;
  message: string;
  data: Kehadiran[];
}

export interface KehadiranSingleResponse {
  status: number;
  message: string;
  data: Kehadiran | null;
}

export interface KehadiranSummaryItem {
  karyawan: {
    id: string;
    nama: string;
    departemen: Array<{ id: string; nama: string }>;
    jabatan: Array<{ id: string; nama: string }>;
  };
  total: number;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpa: number;
  belumAbsen: number;
  persentaseKehadiran: number;
}

export interface KehadiranSummaryResponse {
  status: number;
  message: string;
  data: KehadiranSummaryItem[];
}

export interface CheckInRequest {
  lokasi?: string;
  keterangan?: string;
}

export interface CheckOutRequest {
  keterangan?: string;
}

export interface KehadiranCreateRequest {
  karyawanId: string;
  tanggal: string;
  status: KehadiranStatus;
  waktuMasuk?: string;
  waktuKeluar?: string;
  lokasi?: string;
  keterangan?: string;
}

export interface KehadiranUpdateRequest {
  status?: KehadiranStatus;
  waktuMasuk?: string;
  waktuKeluar?: string;
  keterangan?: string;
}
