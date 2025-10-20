export interface Departemen {
  id: string;
  nama: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartemenResponse {
  status: number;
  message: string;
  data: Departemen[];
}

export interface DepartemenCreateRequest {
  nama: string;
}

export interface DepartemenUpdateRequest {
  nama: string;
}

export interface DepartemenSingleResponse {
  status: number;
  message: string;
  data: Departemen;
}