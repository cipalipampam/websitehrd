// KPI Indicator Types
export interface KpiIndicator {
  id: string;
  nama: string;
  deskripsi: string | null;
  bobot: number;
  departemenId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KpiIndicatorResponse {
  status: number;
  message: string;
  data: KpiIndicator[];
}

export interface KpiIndicatorSingleResponse {
  status: number;
  message: string;
  data: KpiIndicator;
}

export interface KpiIndicatorCreateRequest {
  nama: string;
  deskripsi?: string;
  bobot: number;
  departemenId?: string;
}

export interface KpiIndicatorUpdateRequest {
  nama?: string;
  deskripsi?: string;
  bobot?: number;
  departemenId?: string;
}

// KPI Detail Types
export interface KpiDetail {
  id: string;
  kpiId: string;
  indikatorId: string;
  target: number;
  realisasi: number | null;
  score: number | null;
  periodeYear?: number;
  periodeMonth?: number;
  createdAt: string;
  updatedAt: string;
  indikator: KpiIndicator;
}

export interface KpiDetailCreateRequest {
  indikatorId: string;
  target: number;
  realisasi?: number;
  periodeYear?: number;
  periodeMonth?: number;
}

export interface KpiDetailUpdateRequest {
  target?: number;
  realisasi?: number;
  periodeYear?: number;
  periodeMonth?: number;
}

// KPI Types
export interface Kpi {
  periodeMonth: number;
  periodeYear: number;
  id: string;
  year: number;
  score: number;
  karyawanId: string;
  createdAt: string;
  updatedAt: string;
  karyawan: {
    id: string;
    nama: string;
    user: {
      username: string;
      email: string;
    };
    departemen: Array<{
      id: string;
      nama: string;
    }>;
    jabatan: Array<{
      id: string;
      nama: string;
    }>;
  };
  kpiDetails: KpiDetail[];
}

export interface KpiResponse {
  status: number;
  message: string;
  data: Kpi[];
}

export interface KpiSingleResponse {
  status: number;
  message: string;
  data: Kpi;
}

export interface KpiCreateRequest {
  karyawanId: string;
  score: number;
  periodeYear: number;
  kpiDetails: Array<{
    indikatorId: string;
    target: number;
    realisasi?: number;
    periodeYear?: number;
    periodeMonth?: number;
  }>;
}

export interface KpiUpdateRequest {
  year?: number;
  kpiDetails?: Array<{
    id?: string;
    indikatorId: string;
    target: number;
    realisasi?: number;
    periodeYear?: number;
    periodeMonth?: number;
  }>;
}

export interface KpiDetailSingleResponse {
  status: number;
  message: string;
  data: KpiDetail;
}

// KPI Bulanan Types
export interface KpiBulanan {
  kpiId?: string;
  detailId?: string;
  karyawanId: string;
  namaKaryawan: string;
  departemenId: string;
  departemen: string;
  tahun: number;
  bulan: string;
  scorePresensi: string;
  scorePelatihan: number;
  bobotPresensi: number;
  bobotPelatihan: number;
  totalBobotIndikatorLain: number;
  totalScoreIndikatorLain: number;
  kpiIndikatorLain: number;
  kpiFinal: number;
}

export interface KpiBulananResponse {
  status: number;
  message: string;
  data: KpiBulanan[];
}