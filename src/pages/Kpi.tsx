import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { kpiAPI, kpiIndicatorAPI, karyawanAPI } from '../services/api';
import type { Kpi as KpiType, KpiIndicator } from '../types/kpi';
import type { Karyawan } from '../types/karyawan';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';
import { AxiosError } from 'axios';

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface KpiDetailFormData {
  indikatorId: string;
  target: string;
  realisasi: string;
}

interface FormData {
  karyawanId: string;
  year: string;
  kpiDetails: KpiDetailFormData[];
}

// Monthly KPI interfaces based on new API response structure
interface MonthlyKpiData {
  karyawanId: string; // "0d0d6784-2e57-49b8-81ef-979586f7db0a"
  kpiId?: string; // KPI ID for detail API
  namaKaryawan: string; // "Sarah Johnson"
  departemenId: string; // "cbe52d63-6932-4da3-9e90-35bfb3a29d04"
  departemen: string; // "HR"
  tahun: number; // 2025
  bulan: string; // "11"
  scorePresensi: string; // "97.5"
  scorePelatihan: number; // 95
  bobotPresensi: number; // 60
  bobotPelatihan: number; // 40
  totalBobotIndikatorLain: number; // 10
  totalScoreIndikatorLain: number; // 1002.6315405009723
  kpiFinal?: number; // Optional since it might not be in all responses
}

interface FilterParams {
  bulan: string;
  departemenId: string;
  year: number;
}

export const Kpi = () => {
  const [kpiList, setKpiList] = useState<KpiType[]>([]);
  const [monthlyKpiList, setMonthlyKpiList] = useState<MonthlyKpiData[]>([]);
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [indicators, setIndicators] = useState<KpiIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  // Removed viewMode - only monthly view is available
  const [filterParams, setFilterParams] = useState<FilterParams>({
    bulan: '11', // November 2025
    departemenId: 'all', // Use 'all' instead of empty string
    year: 2025
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiType | null>(null);
  const [viewingKpi, setViewingKpi] = useState<KpiType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    karyawanId: '',
    year: new Date().getFullYear().toString(),
    kpiDetails: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'success',
    message: '',
  });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  const fetchKpi = async () => {
    try {
      setLoading(true);
      const response = await kpiAPI.getAll();
      console.log('Fetched KPI:', response.data);
      setKpiList(response.data);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Gagal memuat data KPI'
          : 'Gagal memuat data KPI';
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchKaryawan = async () => {
    try {
      const response = await karyawanAPI.getAll();
      setKaryawan(response.data);
    } catch (error) {
      console.error('Error fetching karyawan:', error);
    }
  };

  const fetchIndicators = async () => {
    try {
      const response = await kpiIndicatorAPI.getAll();
      setIndicators(response.data);
    } catch (error) {
      console.error('Error fetching indicators:', error);
    }
  };

  const fetchMonthlyKpi = async (params: Partial<FilterParams> = {}) => {
    try {
      setMonthlyLoading(true);
      
      console.log('=== KPI FETCH START ===');
      console.log('Filter params:', filterParams);
      console.log('Input params:', params);
      
      const bulanValue = params.bulan || filterParams.bulan;
      const yearValue = params.year || filterParams.year;
      
      const finalParams = {
        bulan: `${yearValue}-${bulanValue.padStart(2, '0')}`, // Format to YYYY-MM
        departemenId: (params.departemenId || filterParams.departemenId) !== 'all' 
          ? (params.departemenId || filterParams.departemenId)
          : undefined
      };
      
      console.log('Final API params:', finalParams);
      console.log('Calling kpiAPI.getBulanan with params:', finalParams);
      
      const response = await karyawanAPI.getKpiBulanan(finalParams);
      console.log('API call successful, response received:', response);
      console.log('=== PROCESSING RESPONSE ===');
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Is response array:', Array.isArray(response));
      
      // Process the response - expecting direct array based on your JSON structure
      let processedData: MonthlyKpiData[] = [];
      
      if (Array.isArray(response) && response.length > 0) {
        console.log('Processing response array with', response.length, 'items');
        console.log('First item keys:', Object.keys(response[0]));
        console.log('Sample item:', response[0]);
        
        processedData = response.map((item: any, index: number) => {
          return {
            karyawanId: item.karyawanId || '',
            kpiId: item.kpiId || item.id || undefined, // Try kpiId or id
            namaKaryawan: item.namaKaryawan || '',
            departemenId: item.departemenId || '',
            departemen: item.departemen || '',
            tahun: Number(item.tahun || new Date().getFullYear()),
            bulan: String(item.bulan || ''),
            scorePresensi: String(item.scorePresensi || '0'),
            scorePelatihan: Number(item.scorePelatihan || 0),
            bobotPresensi: Number(item.bobotPresensi || 0),
            bobotPelatihan: Number(item.bobotPelatihan || 0),
            totalBobotIndikatorLain: Number(item.totalBobotIndikatorLain || 0),
            totalScoreIndikatorLain: Number(item.totalScoreIndikatorLain || 0),
            kpiFinal: Number(item.kpiFinal || 0)
          };
        });
      } else if (response && !Array.isArray(response)) {
        console.log('Response is not an array. Full structure:', JSON.stringify(response, null, 2));
        // Check if there's a data property or other wrapper
        if (response.data && Array.isArray(response.data)) {
          console.log('Found data array in response.data');
          processedData = response.data.map((item: any) => ({
            karyawanId: item.karyawanId || '',
            namaKaryawan: item.namaKaryawan || '',
            departemenId: item.departemenId || '',
            departemen: item.departemen || '',
            tahun: Number(item.tahun || new Date().getFullYear()),
            bulan: String(item.bulan || ''),
            scorePresensi: String(item.scorePresensi || '0'),
            scorePelatihan: Number(item.scorePelatihan || 0),
            bobotPresensi: Number(item.bobotPresensi || 0),
            bobotPelatihan: Number(item.bobotPelatihan || 0),
            totalBobotIndikatorLain: Number(item.totalBobotIndikatorLain || 0),
            totalScoreIndikatorLain: Number(item.totalScoreIndikatorLain || 0),
            kpiFinal: Number(item.kpiFinal || 0)
          }));
        } else {
          processedData = [];
        }
      } else {
        console.log('Empty or null response received');
        processedData = [];
      }
      
      console.log('=== FINAL PROCESSING ===');
      console.log('Processed monthly KPI data:', processedData);
      console.log('Sample processed item:', processedData[0]);
      console.log('Data structure check:', {
        totalRecords: processedData.length,
        hasKaryawanId: processedData.filter(item => item.karyawanId).length,
        hasNamaKaryawan: processedData.filter(item => item.namaKaryawan).length,
        kpiFinalRange: processedData.map(item => item.kpiFinal),
        scorePresensiValues: processedData.map(item => item.scorePresensi)
      });
      setMonthlyKpiList(processedData);
      console.log('Monthly KPI state updated with', processedData.length, 'items');
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error fetching monthly KPI:', error);
      console.error('Error details:', {
        message: (error as any).message,
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText,
        data: (error as any).response?.data,
        config: {
          url: (error as any).config?.url,
          method: (error as any).config?.method,
          baseURL: (error as any).config?.baseURL
        }
      });
      
      setMonthlyKpiList([]);
      const errorMessage =
        error instanceof AxiosError
          ? `API Error (${error.response?.status}): ${error.response?.data?.message || error.message || 'Gagal memuat data KPI bulanan'}`
          : `Error: ${(error as any).message || 'Gagal memuat data KPI bulanan'}`;
      showAlert('error', errorMessage);
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    fetchKpi();
    fetchKaryawan();
    fetchIndicators();
  }, []);

  useEffect(() => {
    fetchMonthlyKpi();
  }, [filterParams]);

  const handleFilterChange = (key: keyof FilterParams, value: string | number) => {
    const newParams = {
      ...filterParams,
      [key]: value
    };
    setFilterParams(newParams);
    fetchMonthlyKpi(newParams);
  };

  const getMonthName = (monthNumber: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500' };
    if (score >= 80) return { level: 'Very Good', color: 'bg-blue-500' };
    if (score >= 70) return { level: 'Good', color: 'bg-yellow-500' };
    if (score >= 60) return { level: 'Fair', color: 'bg-orange-500' };
    return { level: 'Needs Improvement', color: 'bg-red-500' };
  };

  const handleOpenDialog = (kpi?: KpiType) => {
    if (kpi) {
      console.log('Editing KPI:', kpi);
      setEditingKpi(kpi);
      setFormData({
        karyawanId: kpi.karyawanId,
        year: kpi.year.toString(),
        kpiDetails: kpi.kpiDetails.map((detail) => ({
          indikatorId: detail.indikatorId,
          target: detail.target.toString(),
          realisasi: detail.realisasi?.toString() || '',
        })),
      });
    } else {
      console.log('Creating new KPI');
      setEditingKpi(null);
      setFormData({
        karyawanId: '',
        year: new Date().getFullYear().toString(),
        kpiDetails: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingKpi(null);
    setFormData({
      karyawanId: '',
      year: new Date().getFullYear().toString(),
      kpiDetails: [],
    });
  };

  const handleAddKpiDetail = () => {
    setFormData({
      ...formData,
      kpiDetails: [
        ...formData.kpiDetails,
        { indikatorId: '', target: '', realisasi: '' },
      ],
    });
  };

  const handleRemoveKpiDetail = (index: number) => {
    const newDetails = [...formData.kpiDetails];
    newDetails.splice(index, 1);
    setFormData({ ...formData, kpiDetails: newDetails });
  };

  const handleKpiDetailChange = (
    index: number,
    field: keyof KpiDetailFormData,
    value: string
  ) => {
    const newDetails = [...formData.kpiDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, kpiDetails: newDetails });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.karyawanId) {
      showAlert('error', 'Karyawan wajib dipilih');
      return;
    }

    if (!formData.year) {
      showAlert('error', 'Tahun wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        karyawanId: formData.karyawanId,
        year: parseInt(formData.year),
        kpiDetails: formData.kpiDetails.map((detail) => ({
          indikatorId: detail.indikatorId,
          target: parseFloat(detail.target),
          realisasi: detail.realisasi ? parseFloat(detail.realisasi) : undefined,
        })),
      };

      if (editingKpi) {
        console.log('Submitting update for ID:', editingKpi.id);
        await kpiAPI.update(editingKpi.id, {
          year: submitData.year,
          kpiDetails: submitData.kpiDetails,
        });
        showAlert('success', 'KPI berhasil diupdate');
      } else {
        console.log('Submitting new KPI');
        await kpiAPI.create(submitData);
        showAlert('success', 'KPI berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchKpi();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Terjadi kesalahan'
          : error instanceof Error
          ? error.message
          : 'Terjadi kesalahan';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSubmitting(true);
      console.log('Deleting KPI ID:', deletingId);
      await kpiAPI.delete(deletingId);
      showAlert('success', 'KPI berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchKpi();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Gagal menghapus KPI'
          : 'Gagal menghapus KPI';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    console.log('Opening delete dialog for ID:', id);
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  // Fungsi untuk membuka detail KPI dan mengambil data dari API
  const openDetailDialog = async (kpiId: string) => {
    try {
      const detail = await kpiAPI.getById(kpiId);
      setViewingKpi(detail);
      setIsDetailDialogOpen(true);
    } catch (error) {
      showAlert('error', 'Gagal mengambil detail KPI');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Alert Messages */}
          {alert.show && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
              {alert.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KPI Karyawan</h1>
              <p className="text-gray-500 mt-1">
                Kelola penilaian kinerja karyawan - Data Bulanan
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah KPI
              </Button>
            </div>
          </div>

          {/* Filters for Monthly View */}
          {
            <Card>
              <CardHeader>
                <CardTitle>Filter Data KPI Bulanan</CardTitle>
                <CardDescription>
                  Pilih parameter untuk menampilkan data KPI bulanan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tahun</Label>
                    <Select 
                      value={filterParams.year.toString()} 
                      onValueChange={(value) => handleFilterChange('year', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Select 
                      value={filterParams.bulan} 
                      onValueChange={(value) => handleFilterChange('bulan', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, '0');
                          return (
                            <SelectItem key={month} value={month}>
                              {getMonthName(month)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Departemen (Opsional)</Label>
                    <Select 
                      value={filterParams.departemenId} 
                      onValueChange={(value) => handleFilterChange('departemenId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Departemen</SelectItem>
                        {/* Will be populated when departemen data is available */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          }

          <Card>
            <CardHeader>
              <CardTitle>
                KPI Bulanan - {getMonthName(filterParams.bulan)} {filterParams.year}
              </CardTitle>
              <CardDescription>
                Menampilkan KPI karyawan berdasarkan parameter bulanan yang dipilih
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : monthlyKpiList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada data KPI untuk {getMonthName(filterParams.bulan)} {filterParams.year}</p>
                  <p className="text-sm mt-2">Coba ubah filter bulan atau tahun</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Score Presensi</TableHead>
                      <TableHead>Score Pelatihan</TableHead>
                      <TableHead>Total Score Indikator Lain</TableHead>
                      <TableHead>KPI Final</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyKpiList.map((monthlyKpi, index) => {
                      const performance = monthlyKpi.kpiFinal ? getPerformanceLevel(monthlyKpi.kpiFinal) : { level: 'No Data', color: 'bg-gray-500' };
                      return (
                        <TableRow key={`monthly-kpi-${index}-${monthlyKpi.karyawanId || 'unknown'}-${monthlyKpi.bulan || 'unknown'}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{monthlyKpi.namaKaryawan}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{monthlyKpi.departemen}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{getMonthName(monthlyKpi.bulan)}</div>
                              <div className="text-gray-500">{monthlyKpi.tahun}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{monthlyKpi.scorePresensi}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{monthlyKpi.scorePelatihan}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{monthlyKpi.totalScoreIndikatorLain.toFixed(2)}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {monthlyKpi.kpiFinal ? (
                                <Badge className={getScoreColor(monthlyKpi.kpiFinal)}>
                                  {monthlyKpi.kpiFinal.toFixed(1)}
                                </Badge>
                              ) : (
                                <Badge variant="outline">-</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={performance.color}>
                              {performance.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (monthlyKpi.kpiId) {
                                    await openDetailDialog(monthlyKpi.kpiId);
                                  } else {
                                    showAlert('error', 'KPI ID tidak ditemukan untuk data ini');
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Create new KPI for this employee
                                  setFormData({
                                    karyawanId: monthlyKpi.karyawanId,
                                    year: monthlyKpi.tahun.toString(),
                                    kpiDetails: []
                                  });
                                  handleOpenDialog();
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingKpi ? 'Edit KPI' : 'Tambah KPI'}
            </DialogTitle>
            <DialogDescription>
              {editingKpi
                ? `Update informasi KPI (ID: ${editingKpi.id})`
                : 'Tambahkan KPI baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="karyawanId">
                    Karyawan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.karyawanId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, karyawanId: value })
                    }
                    disabled={submitting || !!editingKpi}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih karyawan" />
                    </SelectTrigger>
                    <SelectContent>
                      {karyawan.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">
                    Tahun <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    min="2000"
                    max="2100"
                    placeholder="2024"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>KPI Details</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddKpiDetail}
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Detail
                  </Button>
                </div>

                {formData.kpiDetails.map((detail, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label>Indikator</Label>
                            <Select
                              value={detail.indikatorId}
                              onValueChange={(value) =>
                                handleKpiDetailChange(index, 'indikatorId', value)
                              }
                              disabled={submitting}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih indikator" />
                              </SelectTrigger>
                              <SelectContent>
                                {indicators.map((ind) => (
                                  <SelectItem key={ind.id} value={ind.id}>
                                    {ind.nama} ({(ind.bobot * 100).toFixed(0)}%)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Target</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="100"
                                value={detail.target}
                                onChange={(e) =>
                                  handleKpiDetailChange(
                                    index,
                                    'target',
                                    e.target.value
                                  )
                                }
                                disabled={submitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Realisasi</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="95"
                                value={detail.realisasi}
                                onChange={(e) =>
                                  handleKpiDetailChange(
                                    index,
                                    'realisasi',
                                    e.target.value
                                  )
                                }
                                disabled={submitting}
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveKpiDetail(index)}
                          disabled={submitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingKpi ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail KPI</DialogTitle>
            <DialogDescription>
              Informasi lengkap KPI karyawan
            </DialogDescription>
          </DialogHeader>
          {viewingKpi && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Karyawan</Label>
                  <p className="font-medium">{viewingKpi.karyawan.nama}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Tahun</Label>
                  <p className="font-medium">{viewingKpi.year}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Total Score</Label>
                  <Badge className={getScoreColor(viewingKpi.score)}>
                    {viewingKpi.score.toFixed(2)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Departemen</Label>
                  <p className="font-medium">
                    {viewingKpi.karyawan.departemen[0]?.nama || '-'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  KPI Details
                </Label>
                {viewingKpi.kpiDetails && viewingKpi.kpiDetails.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Indikator</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Bobot</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Realisasi</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingKpi.kpiDetails.map((detail: any) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.indikator?.nama || '-'}
                          </TableCell>
                          <TableCell>
                            {detail.indikator?.deskripsi || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {detail.indikator?.bobot ? (detail.indikator.bobot * 100).toFixed(0) + '%' : '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>{detail.target}</TableCell>
                          <TableCell>{detail.realisasi !== null && detail.realisasi !== undefined ? detail.realisasi : '-'}</TableCell>
                          <TableCell>
                            {detail.score !== null && detail.score !== undefined ? (
                              <Badge className={getScoreColor(detail.score)}>
                                {detail.score.toFixed(2)}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-gray-500 py-4">Tidak ada detail KPI tersedia.</div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus KPI ini? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
              }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};