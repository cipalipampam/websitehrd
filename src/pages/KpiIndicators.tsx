import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { kpiIndicatorAPI, departemenAPI } from '../services/api';
import type { KpiIndicator } from '../types/kpi';
import type { Departemen } from '../types/departemen';
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
import { Textarea } from '../components/ui/textarea';
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
import { Plus, Pencil, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AxiosError } from 'axios';

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface FormData {
  nama: string;
  deskripsi: string;
  bobot: string;
  departemenId: string;
}

export const KpiIndicators = () => {
  const [indicators, setIndicators] = useState<KpiIndicator[]>([]);
  const [departemen, setDepartemen] = useState<Departemen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<KpiIndicator | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    deskripsi: '',
    bobot: '',
    departemenId: '',
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

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const response = await kpiIndicatorAPI.getAll();
      console.log('Fetched indicators:', response.data);
      setIndicators(response.data);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Gagal memuat data indikator KPI'
          : 'Gagal memuat data indikator KPI';
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartemen = async () => {
    try {
      const response = await departemenAPI.getAll();
      setDepartemen(response.data);
    } catch (error) {
      console.error('Error fetching departemen:', error);
    }
  };

  useEffect(() => {
    fetchIndicators();
    fetchDepartemen();
  }, []);

  const handleOpenDialog = (indicator?: KpiIndicator) => {
    if (indicator) {
      console.log('Editing indicator:', indicator);
      setEditingIndicator(indicator);
      setFormData({
        nama: indicator.nama,
        deskripsi: indicator.deskripsi || '',
        bobot: (indicator.bobot * 100).toString(),
        departemenId: indicator.departemenId || '',
      });
    } else {
      console.log('Creating new indicator');
      setEditingIndicator(null);
      setFormData({
        nama: '',
        deskripsi: '',
        bobot: '',
        departemenId: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndicator(null);
    setFormData({
      nama: '',
      deskripsi: '',
      bobot: '',
      departemenId: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      showAlert('error', 'Nama indikator wajib diisi');
      return;
    }

    if (!formData.bobot || parseFloat(formData.bobot) < 0 || parseFloat(formData.bobot) > 100) {
      showAlert('error', 'Bobot harus antara 0-100');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        nama: formData.nama,
        deskripsi: formData.deskripsi || undefined,
        bobot: parseFloat(formData.bobot) / 100,
        departemenId: formData.departemenId || undefined,
      };

      if (editingIndicator) {
        console.log('Submitting update for ID:', editingIndicator.id);
        await kpiIndicatorAPI.update(editingIndicator.id, submitData);
        showAlert('success', 'Indikator KPI berhasil diupdate');
      } else {
        console.log('Submitting new indicator');
        await kpiIndicatorAPI.create(submitData);
        showAlert('success', 'Indikator KPI berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchIndicators();
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
      console.log('Deleting indicator ID:', deletingId);
      await kpiIndicatorAPI.delete(deletingId);
      showAlert('success', 'Indikator KPI berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchIndicators();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Gagal menghapus indikator KPI'
          : 'Gagal menghapus indikator KPI';
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

  const getDepartemenName = (departemenId: string | null) => {
    if (!departemenId) return 'Semua Departemen';
    const dept = departemen.find((d) => d.id === departemenId);
    return dept?.nama || 'Unknown';
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
              <h1 className="text-3xl font-bold text-gray-900">Indikator KPI</h1>
              <p className="text-gray-500 mt-1">
                Kelola indikator penilaian kinerja karyawan
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Indikator
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Indikator KPI</CardTitle>
              <CardDescription>
                Menampilkan semua indikator KPI yang terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : indicators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data indikator KPI
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Indikator</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Bobot</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicators.map((indicator, index) => (
                      <TableRow key={indicator.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{indicator.nama}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {indicator.deskripsi || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {(indicator.bobot * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getDepartemenName(indicator.departemenId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Edit button clicked for:', indicator);
                                handleOpenDialog(indicator);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(indicator.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndicator ? 'Edit Indikator KPI' : 'Tambah Indikator KPI'}
            </DialogTitle>
            <DialogDescription>
              {editingIndicator
                ? `Update informasi indikator KPI (ID: ${editingIndicator.id})`
                : 'Tambahkan indikator KPI baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Indikator <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Project Delivery Rate"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Deskripsi indikator KPI"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  disabled={submitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bobot">
                  Bobot (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bobot"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Contoh: 60"
                  value={formData.bobot}
                  onChange={(e) =>
                    setFormData({ ...formData, bobot: e.target.value })
                  }
                  disabled={submitting}
                />
                <p className="text-sm text-gray-500">
                  Masukkan bobot dalam persen (0-100)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departemenId">Departemen</Label>
                <Select
                  value={formData.departemenId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departemenId: value })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {departemen.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {editingIndicator ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus indikator KPI ini? Tindakan ini
              tidak dapat dibatalkan.
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