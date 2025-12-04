import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { predictAPI, departemenAPI, karyawanAPI } from "../services/api";
import type {
  PredictInput,
  BatchPredictResult,
  KaryawanPredictResponse,
  PredictResponse,
} from "../types/predict";
import type { Departemen } from "../types/departemen";
import type { Karyawan } from "../types/karyawan";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Brain,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  User as UserIcon,
  Download,
} from "lucide-react";
import { AxiosError } from "axios";
import { Badge } from "../components/ui/badge";

interface AlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

// Type untuk hasil prediksi
type PredictionResultData =
  | PredictResponse["data"]
  | KaryawanPredictResponse["data"]
  | null;

export const Predict = () => {
  // State untuk form manual
  const [formData, setFormData] = useState<PredictInput>({
    departemen: "",
    pendidikan: "",
    gender: "",
    jalur_rekrut: "",
    jumlah_pelatihan: 0,
    umur: 0,
    lama_bekerja: 0,
    "KPI_>80%": 0,
    penghargaan: 0,
    rata_rata_score_pelatihan: 0,
  });

  // State untuk prediksi karyawan
  const [selectedKaryawanId, setSelectedKaryawanId] = useState("");
  const [karyawanYear, setKaryawanYear] = useState(new Date().getFullYear());

  // State untuk batch predict
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [batchFilter, setBatchFilter] = useState<
    "all" | "promosi" | "tidak_promosi"
  >("all");
  const [batchResults, setBatchResults] = useState<BatchPredictResult[]>([]);

  // State umum
  const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResultData>(null);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 5000);
  };

  useEffect(() => {
    fetchDepartemen();
    fetchKaryawan();
  }, []);

  const fetchDepartemen = async () => {
    try {
      const response = await departemenAPI.getAll();
      setDepartemenList(response.data);
    } catch (error) {
      console.error("Failed to fetch departemen:", error);
    }
  };

  const fetchKaryawan = async () => {
    try {
      const response = await karyawanAPI.getAll();
      setKaryawanList(response.data);
    } catch (error) {
      console.error("Failed to fetch karyawan:", error);
    }
  };

  const handleManualPredict = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await predictAPI.predict(formData);
      setPredictionResult(response.data);
      showAlert("success", "Prediksi berhasil!");
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?. message || "Gagal melakukan prediksi"
          : "Gagal melakukan prediksi";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKaryawanPredict = async () => {
    if (!selectedKaryawanId) {
      showAlert("error", "Pilih karyawan terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const response = await predictAPI.predictKaryawan(
        selectedKaryawanId,
        karyawanYear
      );
      setPredictionResult(response. data);
      showAlert("success", "Prediksi berhasil!");
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Gagal melakukan prediksi"
          : "Gagal melakukan prediksi";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchPredict = async () => {
    try {
      setLoading(true);
      const filterValue = batchFilter === "all" ? undefined : batchFilter;
      const response = await predictAPI.predictBatch(batchYear, filterValue);
      setBatchResults(response.data);
      showAlert(
        "success",
        `Prediksi batch berhasil! Total: ${response.total} karyawan`
      );
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Gagal melakukan prediksi batch"
          : "Gagal melakukan prediksi batch";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Nama", "Prediksi"];
    const rows = batchResults.map((result) => [result.nama, result.prediction]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document. createElement("a");
    a. href = url;
    a. download = `prediksi-promosi-${batchYear}.csv`;
    a.click();
  };

  const getPredictionBadge = (prediction: string) => {
    return prediction === "Promosi" ?  (
      <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-medium px-4 py-1. 5 rounded-full">
        <TrendingUp className="mr-1. 5 h-3. 5 w-3.5" />
        Promosi
      </Badge>
    ) : (
      <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-medium px-4 py-1.5 rounded-full">
        <TrendingDown className="mr-1.5 h-3.5 w-3.5" />
        Tidak Promosi
      </Badge>
    );
  };

  const stats = {
    total: batchResults. length,
    promosi: batchResults.filter((r) => r.prediction_value === 1).length,
    tidakPromosi: batchResults.filter((r) => r.prediction_value === 0).length,
  };

  // Helper function to get jabatan name safely
  const getJabatanName = (karyawan: Karyawan): string => {
    if (
      karyawan.jabatan &&
      Array.isArray(karyawan. jabatan) &&
      karyawan.jabatan.length > 0
    ) {
      return karyawan.jabatan[0].nama;
    }
    return "Tidak ada jabatan";
  };

  // Type guard to check if result has nama property
  const hasNamaProperty = (
    result: PredictionResultData
  ): result is KaryawanPredictResponse["data"] => {
    return result !== null && "nama" in result;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Alert Messages */}
          {alert.show && (
            <Alert variant={alert.type === "error" ? "destructive" : "default"}>
              {alert.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                Prediksi Promosi
              </h1>
              <p className="text-gray-500 mt-1">
                Gunakan AI untuk memprediksi promosi karyawan
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
              <TabsTrigger value="karyawan">Per Karyawan</TabsTrigger>
              <TabsTrigger value="batch">Batch Predict</TabsTrigger>
            </TabsList>

            {/* Manual Prediction Tab */}
            <TabsContent value="manual">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Data Manual</CardTitle>
                    <CardDescription>
                      Masukkan data untuk prediksi promosi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleManualPredict} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Departemen</Label>
                          <Select
                            value={formData.departemen}
                            onValueChange={(value) =>
                              setFormData({ ...formData, departemen: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih departemen" />
                            </SelectTrigger>
                            <SelectContent>
                              {departemenList.map((dept) => (
                                <SelectItem key={dept.id} value={dept.nama}>
                                  {dept. nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Pendidikan</Label>
                          <Select
                            value={formData. pendidikan}
                            onValueChange={(value) =>
                              setFormData({ ...formData, pendidikan: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih pendidikan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Magister">Magister</SelectItem>
                              <SelectItem value="Sarjana">Sarjana</SelectItem>
                              <SelectItem value="Dibawah Keduanya">
                                Dibawah Keduanya
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) =>
                              setFormData({ ... formData, gender: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pria">Pria</SelectItem>
                              <SelectItem value="Wanita">Wanita</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Jalur Rekrut</Label>
                          <Select
                            value={formData.jalur_rekrut}
                            onValueChange={(value) =>
                              setFormData({ ...formData, jalur_rekrut: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jalur" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wawancara">
                                Wawancara
                              </SelectItem>
                              <SelectItem value="Undangan">Undangan</SelectItem>
                              <SelectItem value="lainnya">lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Umur</Label>
                          <Input
                            type="number"
                            value={formData. umur}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                umur: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Lama Bekerja (tahun)</Label>
                          <Input
                            type="number"
                            value={formData.lama_bekerja}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lama_bekerja: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Jumlah Pelatihan</Label>
                          <Input
                            type="number"
                            value={formData.jumlah_pelatihan}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                jumlah_pelatihan: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>KPI {">"} 80% ? </Label>
                          <Select
                            value={formData["KPI_>80%"]. toString()}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                "KPI_>80%": parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih KPI" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Di bawah 80%</SelectItem>
                              <SelectItem value="1">Di atas 80%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Mendapat Penghargaan ? </Label>
                          <Select
                            value={formData. penghargaan.toString()}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                penghargaan: parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ketersediaan Penghargaan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Tidak</SelectItem>
                              <SelectItem value="1">Ada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Rata-rata Score Pelatihan</Label>
                          <Input
                            type="number"
                            value={formData.rata_rata_score_pelatihan}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rata_rata_score_pelatihan:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Brain className="mr-2 h-4 w-4" />
                        Prediksi
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Result Card */}
                {predictionResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hasil Prediksi</CardTitle>
                      <CardDescription>
                        Hasil prediksi promosi karyawan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600 mb-4">
                          Hasil Prediksi
                        </p>
                        {getPredictionBadge(predictionResult.prediction)}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Karyawan Prediction Tab */}
            <TabsContent value="karyawan">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Prediksi Per Karyawan
                    </CardTitle>
                    <CardDescription>
                      Pilih karyawan untuk prediksi promosi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pilih Karyawan</Label>
                      <Select
                        value={selectedKaryawanId}
                        onValueChange={setSelectedKaryawanId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih karyawan" />
                        </SelectTrigger>
                        <SelectContent>
                          {karyawanList.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama} - {getJabatanName(k)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tahun</Label>
                      <Input
                        type="number"
                        value={karyawanYear}
                        onChange={(e) =>
                          setKaryawanYear(parseInt(e.target. value))
                        }
                      />
                    </div>

                    <Button
                      onClick={handleKaryawanPredict}
                      className="w-full"
                      disabled={loading || !selectedKaryawanId}
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Brain className="mr-2 h-4 w-4" />
                      Prediksi
                    </Button>
                  </CardContent>
                </Card>

                {/* Result Card */}
                {predictionResult && hasNamaProperty(predictionResult) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hasil Prediksi</CardTitle>
                      <CardDescription>
                        {predictionResult.nama} - Tahun {predictionResult.year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600 mb-4">
                          Hasil Prediksi
                        </p>
                        {getPredictionBadge(predictionResult.prediction)}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Batch Prediction Tab */}
            <TabsContent value="batch">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Prediksi Batch
                  </CardTitle>
                  <CardDescription>
                    Prediksi promosi untuk semua karyawan sekaligus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tahun</Label>
                      <Input
                        type="number"
                        value={batchYear}
                        onChange={(e) => setBatchYear(parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Filter</Label>
                      <Select
                        value={batchFilter}
                        onValueChange={(
                          value: "all" | "promosi" | "tidak_promosi"
                        ) => setBatchFilter(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="promosi">Promosi</SelectItem>
                          <SelectItem value="tidak_promosi">
                            Tidak Promosi
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end gap-2">
                      <Button
                        onClick={handleBatchPredict}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Brain className="mr-2 h-4 w-4" />
                        Prediksi
                      </Button>
                      {batchResults.length > 0 && (
                        <Button
                          onClick={exportToCSV}
                          variant="outline"
                          disabled={loading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  {batchResults.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="border-gray-200">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              Total
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                              {stats.total}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-green-200 bg-green-50/50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-700 mb-1">
                              Promosi
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                              {stats.promosi}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-red-200 bg-red-50/50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-red-700 mb-1">
                              Tidak Promosi
                            </p>
                            <p className="text-3xl font-bold text-red-600">
                              {stats.tidakPromosi}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Results Table - BALANCED LAYOUT */}
                  {batchResults.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-20 text-center font-semibold">
                              No
                            </TableHead>
                            <TableHead className="font-semibold">
                              Nama
                            </TableHead>
                            <TableHead className="text-center font-semibold">
                              Prediksi
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batchResults.map((result, index) => (
                            <TableRow 
                              key={result.karyawan_id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <TableCell className="text-center text-gray-600 font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {result.nama}
                              </TableCell>
                              <TableCell className="text-center">
                                {getPredictionBadge(result.prediction)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};