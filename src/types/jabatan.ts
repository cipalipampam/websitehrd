export interface Jabatan {
  id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JabatanResponse {
  status: number;
  message: string;
  data: Jabatan[];
}

export interface JabatanCreateRequest {
  nama: string;
}

export interface JabatanUpdateRequest {
  nama: string;
}

export interface JabatanSingleResponse {
  status: number;
  message: string;
  data: Jabatan;
}