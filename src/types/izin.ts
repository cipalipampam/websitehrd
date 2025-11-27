export type IzinStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type IzinJenis = 'IZIN' | 'SAKIT';

export interface IzinRequest {
  id: string;
  karyawanId: string;
  tanggal: string;
  jenis: IzinJenis;
  keterangan?: string;
  fileUrl?: string;
  status: IzinStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  karyawan?: {
    id: string;
    nama: string;
    userId: string;
  };
}

export interface IzinRequestResponse {
  status: number;
  message: string;
  data: IzinRequest[];
}

export interface IzinRequestSingleResponse {
  status: number;
  message: string;
  data: IzinRequest;
}
