export interface PredictInput {
  departemen: string;
  pendidikan: string;
  gender: string;
  jalur_rekrut: string;
  jumlah_pelatihan: number;
  umur: number;
  lama_bekerja: number;
  "KPI_>80%": number;
  penghargaan: number;
  rata_rata_score_pelatihan: number;
}

// Ubah probability dari array menjadi object
export interface ProbabilityObject {
  tidak_promosi: number;
  promosi: number;
}

export interface PredictionResult {
  prediction: string;
  prediction_value: number;
  probability: ProbabilityObject; // ✅ Ubah ke object
  confidence: number;
}

export interface PredictResponse {
  status: number;
  message: string;
  data: {
    input: PredictInput;
    prediction: string;
    prediction_value: number;
    probability: ProbabilityObject; // ✅ Ubah ke object
    confidence: number;
  };
}

export interface KaryawanPredictResponse {
  status: number;
  message: string;
  data: {
    karyawan_id: string;
    nama: string;
    year: number;
    features: PredictInput;
    prediction: string;
    prediction_value: number;
    probability: ProbabilityObject; // ✅ Ubah ke object
    confidence: number;
  };
}

export interface BatchPredictResult {
  karyawan_id: string;
  nama: string;
  prediction: string;
  prediction_value: number;
  probability: ProbabilityObject; // ✅ Ubah ke object
  confidence: number;
  error?: string;
}

export interface BatchPredictResponse {
  status: number;
  message: string;
  year: number;
  total: number;
  data: BatchPredictResult[];
}