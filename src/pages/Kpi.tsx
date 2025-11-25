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

export const Kpi = () => {
  const [kpiList, setKpiList] = useState<KpiType[]>([]);
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [indicators, setIndicators] = useState<KpiIndicator[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchKpi();
    fetchKaryawan();
    fetchIndicators();
  }, []);

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

  const openDetailDialog = (kpi: KpiType) => {
    setViewingKpi(kpi);
    setIsDetailDialogOpen(true);
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
                Kelola penilaian kinerja karyawan
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah KPI
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar KPI</CardTitle>
              <CardDescription>
                Menampilkan semua KPI karyawan yang terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : kpiList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data KPI
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiList.map((kpi, index) => (
                      <TableRow key={kpi.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{kpi.karyawan.nama}</TableCell>
                        <TableCell>{kpi.year}</TableCell>
                        <TableCell>
                          <Badge className={getScoreColor(kpi.score)}>
                            {kpi.score.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {kpi.karyawan.departemen[0]?.nama || '-'}
                        </TableCell>
                        <TableCell>
                          {kpi.karyawan.jabatan[0]?.nama || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailDialog(kpi)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(kpi)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(kpi.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indikator</TableHead>
                      <TableHead>Bobot</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Realisasi</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingKpi.kpiDetails.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-medium">
                          {detail.indikator.nama}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {(detail.indikator.bobot * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{detail.target}</TableCell>
                        <TableCell>{detail.realisasi || '-'}</TableCell>
                        <TableCell>
                          {detail.score ? (
                            <Badge
                              className={getScoreColor(detail.score)}
                            >
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