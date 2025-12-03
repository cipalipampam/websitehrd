import { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { kpiAPI, kpiIndicatorAPI, karyawanAPI, departemenAPI } from '../services/api';
import type { Kpi as KpiType, KpiIndicator } from '../types/kpi';
import type { Karyawan } from '../types/karyawan';
import type { KpiBulanan, KpiBulananResponse } from '../types/kpi';
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
  id?: string;
  indikatorId: string;
  target: string;
  realisasi: string;
  periodeYear?: number;
  periodeMonth?: number;
}

interface FormData {
  karyawanId: string;
  year: string;
  periodeYear?: number;
  periodeMonth?: number;
  kpiDetails: KpiDetailFormData[];
}

interface MonthlyFilterParams {
  bulan: string;
  tahun: string;
  departemenId: string;
}

export const Kpi = () => {
  // core lists
  const [kpiList, setKpiList] = useState<KpiType[]>([]);
  const [monthlyKpiList, setMonthlyKpiList] = useState<KpiBulanan[]>([]);
  const [rawMonthlyKpiList, setRawMonthlyKpiList] = useState<KpiBulanan[]>([]);
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [indicators, setIndicators] = useState<KpiIndicator[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ id: string; name: string }[]>([]);
  const [monthlyFilters, setMonthlyFilters] = useState<MonthlyFilterParams>({
    bulan: 'all',
    tahun: 'all',
    departemenId: 'all',
  });
  const monthOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, idx) => (currentYear - idx).toString());

  // loading / UI states
  const [loading, setLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // dialog & selection states
  const [isDialogOpen, setIsDialogOpen] = useState(false); // create/edit
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false); // view KPI detail (yearly)
  const [monthlyDetailDialogOpen, setMonthlyDetailDialogOpen] = useState(false); // monthly UI popup
  const [isUpdateDetailDialogOpen, setIsUpdateDetailDialogOpen] = useState(false); // update KPI details
  const [isDirectDetailUpdateOpen, setIsDirectDetailUpdateOpen] = useState(false); // direct detail update

  const [editingKpi, setEditingKpi] = useState<KpiType | null>(null);
  const [viewingKpi, setViewingKpi] = useState<KpiType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingKpiForUpdate, setEditingKpiForUpdate] = useState<KpiType | null>(null);
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
  const [editingMonthlyKpi, setEditingMonthlyKpi] = useState<KpiBulanan | null>(null);

  // monthly detail
  const [selectedMonthlyKpi, setSelectedMonthlyKpi] = useState<KpiBulanan | null>(null);
  const [monthlyKpiDetail, setMonthlyKpiDetail] = useState<any | null>(null); // kpiAPI.getById response if exists

  const [formData, setFormData] = useState<FormData>({
    karyawanId: '',
    year: new Date().getFullYear().toString(),
    periodeYear: new Date().getFullYear(),
    periodeMonth: new Date().getMonth() + 1,
    kpiDetails: [],
  });

  const [directDetailForm, setDirectDetailForm] = useState({
    target: '',
    realisasi: '',
    periodeYear: new Date().getFullYear(),
    periodeMonth: new Date().getMonth() + 1,
  });

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'success',
    message: '',
  });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert((s) => ({ ...s, show: false })), 5000);
  };

  /* -------------------------
     Fetch functions (clean)
     ------------------------- */

  const fetchKpi = async () => {
    try {
      setLoading(true);
      const response = await kpiAPI.getAll();
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

  const fetchDepartments = async () => {
    try {
      const response = await departemenAPI.getAll();
      const deptList = (response.data || []).map((dept: any) => ({
        id: dept.id,
        name: dept.nama,
      }));
      setDepartmentOptions(deptList);
    } catch (error) {
      console.error('Error fetching departemen:', error);
    }
  };

  /**
   * Fetch monthly KPI view (full dataset) and apply filters locally.
   * Assumes API returns { status, message, data: KpiBulanan[] }
   */
  const fetchMonthlyKpi = async () => {
    try {
      setMonthlyLoading(true);

      const response = await karyawanAPI.getKpiBulanan();

      const processedData: KpiBulanan[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const normalizedData = processedData.map((item) => ({
        ...item,
        scorePresensi: item.scorePresensi?.toString() ?? '0',
        scorePelatihan: typeof item.scorePelatihan === 'string' ? parseFloat(item.scorePelatihan) : item.scorePelatihan ?? 0,
        bobotPresensi: typeof item.bobotPresensi === 'string' ? parseFloat(item.bobotPresensi) : item.bobotPresensi ?? 0,
        bobotPelatihan: typeof item.bobotPelatihan === 'string' ? parseFloat(item.bobotPelatihan) : item.bobotPelatihan ?? 0,
        totalBobotIndikatorLain: typeof item.totalBobotIndikatorLain === 'string' ? parseFloat(item.totalBobotIndikatorLain) : item.totalBobotIndikatorLain ?? 0,
        totalScoreIndikatorLain: typeof item.totalScoreIndikatorLain === 'string' ? parseFloat(item.totalScoreIndikatorLain) : item.totalScoreIndikatorLain ?? 0,
        kpiIndikatorLain: typeof item.kpiIndikatorLain === 'string' ? parseFloat(item.kpiIndikatorLain) : item.kpiIndikatorLain ?? 0,
        kpiFinal: typeof item.kpiFinal === 'string' ? parseFloat(item.kpiFinal) : item.kpiFinal ?? 0,
      }));

      console.log('Setting monthly KPI list:', normalizedData);
      setRawMonthlyKpiList(normalizedData);
      setMonthlyKpiList(applyMonthlyFilters(normalizedData, monthlyFilters));

      const uniqueDepartments = Array.from(
        new Map(
          processedData
            .filter((item) => item.departemen && item.departemenId)
            .map((item) => {
              const deptId = String(item.departemenId);
              return [deptId, { id: deptId, name: item.departemen as string }];
            })
        ).values()
      );
      setDepartmentOptions((prev) => {
        const map = new Map<string, { id: string; name: string }>();
        [...prev, ...uniqueDepartments].forEach((dept) => {
          if (dept?.id) {
            map.set(dept.id, dept);
          }
        });
        return Array.from(map.values());
      });
    } catch (error) {
      console.error('Error fetching monthly KPI:', error);
      showAlert('error', 'Gagal memuat data KPI bulanan');
    } finally {
      setMonthlyLoading(false);
    }
  };


  /* -------------------------
     Lifecycle
     ------------------------- */

  useEffect(() => {
    fetchKpi();
    fetchKaryawan();
    fetchIndicators();
    fetchDepartments();
    fetchMonthlyKpi();
  }, []);

  useEffect(() => {
    setMonthlyKpiList(applyMonthlyFilters(rawMonthlyKpiList, monthlyFilters));
  }, [rawMonthlyKpiList, monthlyFilters]);

  /* -------------------------
     Handlers & helpers
     ------------------------- */

  const getMonthName = (monthNumber: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const idx = parseInt(monthNumber, 10) - 1;
    return months[idx] ?? monthNumber;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500' };
    if (score >= 80) return { level: 'Very Good', color: 'bg-blue-500' };
    if (score >= 70) return { level: 'Good', color: 'bg-yellow-500' };
    if (score >= 60) return { level: 'Fair', color: 'bg-orange-500' };
    return { level: 'Needs Improvement', color: 'bg-red-500' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleResetMonthlyFilters = () => {
    setMonthlyFilters({ bulan: 'all', tahun: 'all', departemenId: 'all' });
  };

  const normalizeToNumber = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return null;
    const parsed = parseInt(value.toString(), 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const applyMonthlyFilters = (data: KpiBulanan[], filters: MonthlyFilterParams) => {
    const selectedMonth = filters.bulan === 'all' ? null : normalizeToNumber(filters.bulan);
    const selectedYear = filters.tahun === 'all' ? null : normalizeToNumber(filters.tahun);
    const selectedDept = filters.departemenId === 'all' ? null : filters.departemenId;

    return data.filter((item) => {
      const itemMonth = normalizeToNumber(item.bulan);
      const monthMatches = selectedMonth === null || itemMonth === selectedMonth;
      const yearMatches = selectedYear === null || item.tahun === selectedYear;
      const deptMatches = selectedDept === null || String(item.departemenId) === selectedDept;
      return monthMatches && yearMatches && deptMatches;
    });
  };

  const selectedKaryawan = useMemo(() => {
    return karyawan.find((item) => item.id === formData.karyawanId) || null;
  }, [karyawan, formData.karyawanId]);

  const selectedDepartemenId = useMemo(() => {
    if (!selectedKaryawan) return null;
    if (selectedKaryawan.departemen && selectedKaryawan.departemen.length > 0) {
      return selectedKaryawan.departemen[0].id;
    }
    return selectedKaryawan.departemenId ?? null;
  }, [selectedKaryawan]);

  const detailIndicatorIds = useMemo(() => {
    return formData.kpiDetails
      .map((detail) => detail.indikatorId)
      .filter((id): id is string => Boolean(id));
  }, [formData.kpiDetails]);

  const filteredIndicators = useMemo(() => {
    let baseList = indicators;
    if (selectedDepartemenId) {
      baseList = indicators.filter((indicator) => indicator.departemenId === selectedDepartemenId);
    }

    if (detailIndicatorIds.length === 0) {
      return baseList;
    }

    const indicatorMap = new Map(baseList.map((indicator) => [indicator.id, indicator]));
    detailIndicatorIds.forEach((id) => {
      if (!indicatorMap.has(id)) {
        const indicator = indicators.find((ind) => ind.id === id);
        if (indicator) {
          indicatorMap.set(id, indicator);
        }
      }
    });

    return Array.from(indicatorMap.values());
  }, [indicators, selectedDepartemenId, detailIndicatorIds]);

  /* -------------------------
     Form dialogs (create / edit)
     ------------------------- */

  const handleOpenDialog = (kpi?: KpiType) => {
    if (kpi) {
      setEditingKpi(kpi);
      setFormData({
        karyawanId: kpi.karyawanId,
        year: kpi.year.toString(),
        periodeYear: kpi.periodeYear ?? new Date().getFullYear(),
        periodeMonth: kpi.periodeMonth ?? new Date().getMonth() + 1,
        kpiDetails: (kpi.kpiDetails || []).map((d: any) => ({
          indikatorId: d.indikatorId,
          target: d.target?.toString() ?? '',
          realisasi: d.realisasi?.toString() ?? '',
        })),
      });
    } else {
      setEditingKpi(null);
      setFormData({
        karyawanId: '',
        year: new Date().getFullYear().toString(),
        periodeYear: new Date().getFullYear(),
        periodeMonth: new Date().getMonth() + 1,
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
      periodeYear: new Date().getFullYear(),
      periodeMonth: new Date().getMonth() + 1,
      kpiDetails: [],
    });
  };

  const handleAddKpiDetail = () => {
    setFormData((prev) => ({
      ...prev,
      kpiDetails: [...prev.kpiDetails, { indikatorId: '', target: '', realisasi: '' }],
    }));
  };

  const handleRemoveKpiDetail = (index: number) => {
    setFormData((prev) => {
      const arr = [...prev.kpiDetails];
      arr.splice(index, 1);
      return { ...prev, kpiDetails: arr };
    });
  };

  const handleKpiDetailChange = (index: number, field: keyof KpiDetailFormData, value: string) => {
    setFormData((prev) => {
      const arr = [...prev.kpiDetails];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, kpiDetails: arr };
    });
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

      const fallbackYear = formData.periodeYear ?? new Date().getFullYear();
      const fallbackMonth = formData.periodeMonth ?? new Date().getMonth() + 1;

      const mappedDetails = formData.kpiDetails.map((d) => ({
        indikatorId: d.indikatorId,
        target: parseFloat(d.target),
        realisasi: d.realisasi ? parseFloat(d.realisasi) : undefined,
        periodeYear: d.periodeYear ?? fallbackYear,
        periodeMonth: d.periodeMonth ?? fallbackMonth,
      }));

      const createPayload = {
        karyawanId: formData.karyawanId,
        score: 0,
        periodeYear: fallbackYear,
        kpiDetails: mappedDetails,
      };

      if (editingKpi) {
        await kpiAPI.update(editingKpi.id, {
          year: parseInt(formData.year, 10),
          kpiDetails: mappedDetails,
        });
        showAlert('success', 'KPI berhasil diupdate');
      } else {
        await kpiAPI.create(createPayload);
        showAlert('success', 'KPI berhasil ditambahkan');
      }

      handleCloseDialog();
      fetchKpi();
      fetchMonthlyKpi();
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

  /* -------------------------
     Delete
     ------------------------- */

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await kpiAPI.delete(deletingId);
      showAlert('success', 'KPI berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchKpi();
      fetchMonthlyKpi();
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

  /* -------------------------
     View detail (yearly KPI)
     ------------------------- */

  const openDetailDialog = async (kpiId: string) => {
    try {
      const response = await kpiAPI.getById(kpiId);
      setViewingKpi(response.data);
      setIsDetailDialogOpen(true);
    } catch (error) {
      showAlert('error', 'Gagal mengambil detail KPI');
    }
  };

  /* -------------------------
     Direct Detail Update Dialog
     ------------------------- */

  const openDirectDetailUpdateDialog = (monthlyKpi: KpiBulanan, detailId: string) => {
    console.log('Opening direct detail update for:', monthlyKpi, detailId);
    setEditingDetailId(detailId);
    setEditingMonthlyKpi(monthlyKpi);
    
    // Initialize form with current values if available
    setDirectDetailForm({
      target: '',
      realisasi: '',
      periodeYear: monthlyKpi.tahun,
      periodeMonth: parseInt(monthlyKpi.bulan, 10),
    });
    
    setIsDirectDetailUpdateOpen(true);
  };

  const handleCloseDirectDetailDialog = () => {
    setIsDirectDetailUpdateOpen(false);
    setEditingDetailId(null);
    setEditingMonthlyKpi(null);
    setDirectDetailForm({
      target: '',
      realisasi: '',
      periodeYear: new Date().getFullYear(),
      periodeMonth: new Date().getMonth() + 1,
    });
  };

  const handleDirectDetailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDetailId || !editingMonthlyKpi) {
      showAlert('error', 'Data tidak lengkap');
      return;
    }

    if (!directDetailForm.target || directDetailForm.target.trim() === '') {
      showAlert('error', 'Target wajib diisi');
      return;
    }

    try {
      setSubmitting(true);

      const updateData: any = {
        target: parseFloat(directDetailForm.target),
      };

      if (directDetailForm.realisasi && directDetailForm.realisasi.trim() !== '') {
        updateData.realisasi = parseFloat(directDetailForm.realisasi);
      }

      if (directDetailForm.periodeYear) {
        updateData.periodeYear = directDetailForm.periodeYear;
      }

      if (directDetailForm.periodeMonth) {
        updateData.periodeMonth = directDetailForm.periodeMonth;
      }

      console.log('Updating detail ID:', editingDetailId, 'with data:', updateData);
      await kpiAPI.updateDetail(editingDetailId, updateData);
      
      showAlert('success', 'Detail KPI berhasil diupdate');
      handleCloseDirectDetailDialog();
      fetchKpi();
      fetchMonthlyKpi();
    } catch (error) {
      console.error('Error updating detail:', error);
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || 'Gagal update detail KPI'
        : 'Gagal update detail KPI';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMonthlyKpi = async (monthlyKpi: KpiBulanan) => {
    console.log('Edit request for monthly KPI:', monthlyKpi);

    // 1. Update via detailId if provided (most precise target)
    if (monthlyKpi.detailId) {
      console.log('Direct detail update via detailId:', monthlyKpi.detailId);
      openDirectDetailUpdateDialog(monthlyKpi, monthlyKpi.detailId);
      return;
    }

    // 2. Try to resolve KPI ID either from payload or fallback search
    const monthNumber = parseInt(monthlyKpi.bulan, 10);
    let targetKpiId = monthlyKpi.kpiId;

    if (!targetKpiId) {
      const matchedKpi = kpiList.find((kpi) => {
        const sameEmployee = kpi.karyawanId === monthlyKpi.karyawanId;
        const sameYear = (kpi.periodeYear ?? kpi.year) === monthlyKpi.tahun;
        const sameMonth = (kpi.periodeMonth ?? monthNumber) === monthNumber;
        return sameEmployee && sameYear && sameMonth;
      });

      if (matchedKpi) {
        console.log('Resolved KPI via fallback search:', matchedKpi.id);
        targetKpiId = matchedKpi.id;
      }
    }

    if (!targetKpiId) {
      showAlert('error', 'Data KPI belum tersedia untuk karyawan dan periode ini. Gunakan tombol "Tambah KPI".');
      return;
    }

    try {
      console.log('Fetching KPI by ID for edit:', targetKpiId);
      setMonthlyLoading(true);
      const res = await kpiAPI.getById(targetKpiId);

      if (!res.data.kpiDetails || res.data.kpiDetails.length === 0) {
        showAlert('error', 'KPI ini belum memiliki detail indikator');
        return;
      }

      openUpdateDetailDialog(res.data);
    } catch (error) {
      console.error('Error fetching KPI for edit:', error);
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || 'Gagal mengambil data KPI'
        : 'Gagal mengambil data KPI';
      showAlert('error', errorMessage);
    } finally {
      setMonthlyLoading(false);
    }
  };

  /* -------------------------
     Update KPI Detail Dialog
     ------------------------- */

  const openUpdateDetailDialog = async (kpi: KpiType) => {
    setEditingKpiForUpdate(kpi);
    
    console.log('=== Opening update dialog with KPI ===');
    console.log('KPI ID:', kpi.id);
    console.log('KPI Year:', kpi.year);
    console.log('KPI kpiDetails count:', kpi.kpiDetails?.length || 0);
    console.log('KPI Details RAW:', JSON.parse(JSON.stringify(kpi.kpiDetails)));
    
    // Map all details without filtering duplicates (backend should ensure uniqueness)
    const mappedDetails = (kpi.kpiDetails || []).map((d: any) => {
      console.log('Mapping detail:', {
        id: d.id,
        indikatorId: d.indikatorId,
        indikatorNama: d.indikator?.nama,
        target: d.target,
        realisasi: d.realisasi,
        periodeYear: d.periodeYear,
        periodeMonth: d.periodeMonth
      });
      return {
        id: d.id,
        indikatorId: d.indikatorId,
        target: d.target?.toString() ?? '',
        realisasi: d.realisasi?.toString() ?? '',
        periodeYear: d.periodeYear,
        periodeMonth: d.periodeMonth,
      };
    });
    
    console.log('Mapped details count:', mappedDetails.length);
    console.log('Mapped details:', mappedDetails);
    
    setFormData({
      karyawanId: kpi.karyawanId,
      year: kpi.year.toString(),
      periodeYear: kpi.periodeYear ?? new Date().getFullYear(),
      periodeMonth: kpi.periodeMonth ?? new Date().getMonth() + 1,
      kpiDetails: mappedDetails,
    });
    setIsUpdateDetailDialogOpen(true);
  };

  const handleCloseUpdateDetailDialog = () => {
    setIsUpdateDetailDialogOpen(false);
    setEditingKpiForUpdate(null);
    setFormData({
      karyawanId: '',
      year: new Date().getFullYear().toString(),
      periodeYear: new Date().getFullYear(),
      periodeMonth: new Date().getMonth() + 1,
      kpiDetails: [],
    });
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingKpiForUpdate) {
      showAlert('error', 'Tidak ada data KPI yang sedang diedit');
      return;
    }

    // Validate all details have required fields
    const invalidDetails = formData.kpiDetails.filter(d => !d.indikatorId || !d.target || d.target.trim() === '');
    if (invalidDetails.length > 0) {
      showAlert('error', 'Indikator dan Target wajib diisi untuk semua detail');
      return;
    }

    try {
      setSubmitting(true);

      console.log('=== Updating KPI with details ===');
      console.log('KPI ID:', editingKpiForUpdate.id);
      console.log('Details count:', formData.kpiDetails.length);
      console.log('Details:', formData.kpiDetails);

      // Prepare payload for PUT /api/kpi/kpi/:id
      // This endpoint will delete old details and create new ones
      const fallbackYear = formData.periodeYear ?? new Date().getFullYear();
      const fallbackMonth = formData.periodeMonth ?? new Date().getMonth() + 1;

      const mappedDetails = formData.kpiDetails.map((d) => {
        const payload: any = {
          id: (d as any).id, // Include ID if exists (for tracking)
          indikatorId: d.indikatorId,
          target: parseFloat(d.target),
          periodeYear: d.periodeYear ?? fallbackYear,
          periodeMonth: d.periodeMonth ?? fallbackMonth,
        };

        if (d.realisasi && d.realisasi.trim() !== '') {
          payload.realisasi = parseFloat(d.realisasi);
        }

        return payload;
      });

      console.log('Mapped details to send:', mappedDetails);

      const updatePayload = {
        year: parseInt(formData.year, 10),
        periodeYear: fallbackYear,
        periodeMonth: fallbackMonth,
        kpiDetails: mappedDetails,
      };

      console.log('Update payload:', updatePayload);

      // Send update request
      const response = await kpiAPI.update(editingKpiForUpdate.id, updatePayload);
      console.log('Update response:', response);

      showAlert('success', `KPI berhasil diupdate dengan ${mappedDetails.length} detail indikator`);
      handleCloseUpdateDetailDialog();
      fetchKpi();
      fetchMonthlyKpi();
    } catch (error) {
      console.error('Update details error:', error);
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

  /* -------------------------
     Monthly detail dialog (uses kpiId from monthly response)
     ------------------------- */

  const openMonthlyDetailDialog = async (monthlyKpi: KpiBulanan) => {
    try {
      setSelectedMonthlyKpi(monthlyKpi);
      // If server provides kpiId, fetch full KPI detail
      if (monthlyKpi.kpiId) {
        const res = await kpiAPI.getById(monthlyKpi.kpiId);
        setMonthlyKpiDetail(res.data);
      } else {
        // Try to resolve KPI id by matching karyawan + period (fallback)
        const monthNumber = parseInt(monthlyKpi.bulan, 10);
        const resolved = kpiList.find((kpi) => {
          const sameEmployee = kpi.karyawanId === monthlyKpi.karyawanId;
          const sameYear = (kpi.periodeYear ?? kpi.year) === monthlyKpi.tahun;
          const sameMonth = (kpi.periodeMonth ?? monthNumber) === monthNumber;
          return sameEmployee && sameYear && sameMonth;
        });

        if (resolved && resolved.id) {
          try {
            const res = await kpiAPI.getById(resolved.id);
            setMonthlyKpiDetail(res.data);
          } catch (err) {
            console.error('Error fetching resolved KPI by ID:', err);
            setMonthlyKpiDetail({ kpiDetails: [] });
          }
        } else {
          // if no KPI found, keep minimal / empty details
          setMonthlyKpiDetail({ kpiDetails: [] });
        }
      }
      setMonthlyDetailDialogOpen(true);
    } catch (error) {
      console.error('Error fetching KPI detail for monthly item:', error);
      setMonthlyKpiDetail({ kpiDetails: [] });
      setMonthlyDetailDialogOpen(true);
    }
  };

  /* -------------------------
     Render
     ------------------------- */

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Alert */}
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
              <p className="text-gray-500 mt-1">Kelola penilaian kinerja karyawan - Data Bulanan</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah KPI
              </Button>
            </div>
          </div>

          {/* Monthly KPI Table */}
          <Card>
            <CardHeader className="space-y-4">
              <div>
                <CardTitle>Data KPI Bulanan</CardTitle>
                <CardDescription>Menampilkan semua data KPI karyawan bulanan</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[150px]">
                  <Label className="text-xs text-muted-foreground">Bulan</Label>
                  <Select
                    value={monthlyFilters.bulan}
                    onValueChange={(value) => setMonthlyFilters((prev) => ({ ...prev, bulan: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Semua Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[150px]">
                  <Label className="text-xs text-muted-foreground">Tahun</Label>
                  <Select
                    value={monthlyFilters.tahun}
                    onValueChange={(value) => setMonthlyFilters((prev) => ({ ...prev, tahun: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Semua Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[180px]">
                  <Label className="text-xs text-muted-foreground">Departemen</Label>
                  <Select
                    value={monthlyFilters.departemenId}
                    onValueChange={(value) => setMonthlyFilters((prev) => ({ ...prev, departemenId: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Semua Departemen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Departemen</SelectItem>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={handleResetMonthlyFilters}>
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {monthlyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : monthlyKpiList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada data KPI bulanan</p>
                  <p className="text-sm mt-2">Data akan muncul setelah KPI ditambahkan</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>Bulan</TableHead>
                      <TableHead>Score Presensi</TableHead>
                      {/* <TableHead>Bobot Presensi</TableHead> */}
                      <TableHead>Score Pelatihan</TableHead>
                      {/* <TableHead>Bobot Pelatihan</TableHead> */}
                      {/* <TableHead>Total Bobot Indikator Lain</TableHead> */}
                      {/* <TableHead>Total Score Indikator Lain</TableHead> */}
                      <TableHead>KPI Indikator Lain</TableHead>
                      <TableHead>KPI Final</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyKpiList.map((monthlyKpi, index) => {
                      const performance = getPerformanceLevel(monthlyKpi.kpiFinal);
                      return (
                        <TableRow key={`monthly-kpi-${index}-${monthlyKpi.karyawanId}-${monthlyKpi.bulan}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{monthlyKpi.namaKaryawan}</TableCell>
                          <TableCell><Badge variant="outline">{monthlyKpi.departemen}</Badge></TableCell>
                          <TableCell>{monthlyKpi.tahun}</TableCell>
                          <TableCell>{getMonthName(monthlyKpi.bulan)}</TableCell>
                          <TableCell><Badge variant="secondary">{monthlyKpi.scorePresensi}%</Badge></TableCell>
                          {/* <TableCell><Badge variant="outline">{monthlyKpi.bobotPresensi}%</Badge></TableCell> */}
                          <TableCell><Badge variant="secondary">{monthlyKpi.scorePelatihan}%</Badge></TableCell>
                          {/* <TableCell><Badge variant="outline">{monthlyKpi.bobotPelatihan}%</Badge></TableCell> */}
                          {/* <TableCell><Badge variant="outline">{monthlyKpi.totalBobotIndikatorLain}</Badge></TableCell> */}
                          {/* <TableCell><Badge variant="secondary">{monthlyKpi.totalScoreIndikatorLain.toFixed(2)}</Badge></TableCell> */}
                          <TableCell><Badge className="bg-purple-500">{monthlyKpi.kpiIndikatorLain.toFixed(2)}</Badge></TableCell>
                          <TableCell><Badge className={getScoreColor(monthlyKpi.kpiFinal)}>{monthlyKpi.kpiFinal.toFixed(2)}</Badge></TableCell>
                          <TableCell><Badge className={performance.color}>{performance.level}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMonthlyDetailDialog(monthlyKpi)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMonthlyKpi(monthlyKpi)}
                                disabled={monthlyLoading}
                              >
                                {monthlyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
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

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingKpi ? 'Edit KPI' : 'Tambah KPI'}</DialogTitle>
            <DialogDescription>
              {editingKpi ? `Update informasi KPI (ID: ${editingKpi.id})` : 'Tambahkan KPI baru ke sistem'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="karyawanId">Karyawan <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.karyawanId}
                    onValueChange={(value) => setFormData({ ...formData, karyawanId: value })}
                    disabled={submitting || !!editingKpi}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih karyawan" />
                    </SelectTrigger>
                    <SelectContent>
                      {karyawan.map((k) => (
                        <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Tahun <span className="text-red-500">*</span></Label>
                  <Input
                    id="year"
                    type="number"
                    min={2000}
                    max={2100}
                    placeholder="2024"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodeYear">Periode Tahun (untuk perhitungan KPI)</Label>
                  <Input
                    id="periodeYear"
                    type="number"
                    min={2000}
                    max={2100}
                    placeholder="2024"
                    value={formData.periodeYear || ''}
                    onChange={(e) => setFormData({ ...formData, periodeYear: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground">Kosongkan untuk menggunakan waktu input otomatis</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodeMonth">Periode Bulan (1-12)</Label>
                  <Input
                    id="periodeMonth"
                    type="number"
                    min={1}
                    max={12}
                    placeholder="1-12"
                    value={formData.periodeMonth || ''}
                    onChange={(e) => setFormData({ ...formData, periodeMonth: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground">Kosongkan untuk menggunakan waktu input otomatis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>KPI Details</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddKpiDetail} disabled={submitting}>
                    <Plus className="h-4 w-4 mr-2" /> Tambah Detail
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
                              onValueChange={(value) => handleKpiDetailChange(index, 'indikatorId', value)}
                              disabled={submitting}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih indikator" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredIndicators.map((indicator) => (
                                  <SelectItem key={indicator.id} value={indicator.id}>
                                    {indicator.nama} ({(indicator.bobot * 100).toFixed(0)}%)
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
                                onChange={(e) => handleKpiDetailChange(index, 'target', e.target.value)}
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
                                onChange={(e) => handleKpiDetailChange(index, 'realisasi', e.target.value)}
                                disabled={submitting}
                              />
                            </div>
                          </div>
                        </div>

                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveKpiDetail(index)} disabled={submitting}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={submitting}>Batal</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingKpi ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog (Yearly KPI) */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail KPI</DialogTitle>
            <DialogDescription>Informasi lengkap KPI karyawan</DialogDescription>
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
                  <Badge className={getScoreColor(viewingKpi.score)}>{viewingKpi.score.toFixed(2)}</Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Departemen</Label>
                  <p className="font-medium">{viewingKpi.karyawan.departemen[0]?.nama || '-'}</p>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">KPI Details</Label>
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
                          <TableCell className="font-medium">{detail.indikator?.nama || '-'}</TableCell>
                          <TableCell>{detail.indikator?.deskripsi || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {detail.indikator?.bobot ? (detail.indikator.bobot * 100).toFixed(0) + '%' : '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>{detail.target}</TableCell>
                          <TableCell>{detail.realisasi ?? '-'}</TableCell>
                          <TableCell>
                            {detail.score != null ? (
                              <Badge className={getScoreColor(detail.score)}>{detail.score.toFixed(2)}</Badge>
                            ) : '-'}
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
            <Button onClick={() => setIsDetailDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monthly Detail Dialog */}
      <Dialog open={monthlyDetailDialogOpen} onOpenChange={setMonthlyDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-1 text-gray-900">Detail Indikator KPI</DialogTitle>
            <DialogDescription className="mb-4 text-gray-500">
              Rincian score dan bobot indikator untuk <span className="font-semibold text-gray-800">{selectedMonthlyKpi?.namaKaryawan || '-'}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedMonthlyKpi && monthlyKpiDetail && (
            <div className="grid grid-cols-2 gap-6">
              {/* KOLOM KIRI - Info Karyawan & Komponen KPI */}
              <div className="space-y-4">
                {/* Header Info */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Karyawan</Label>
                    <div className="font-bold text-lg text-gray-900">{selectedMonthlyKpi.namaKaryawan}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Departemen</Label>
                    <div className="font-bold text-lg text-gray-900">{selectedMonthlyKpi.departemen}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bulan</Label>
                    <div className="font-bold text-lg">{getMonthName(selectedMonthlyKpi.bulan)} {selectedMonthlyKpi.tahun}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">KPI Final</Label>
                    <Badge className={`${getScoreColor(selectedMonthlyKpi.kpiFinal)} text-white font-bold text-lg mt-1`}>
                      {selectedMonthlyKpi.kpiFinal ? selectedMonthlyKpi.kpiFinal.toFixed(2) + '%' : '-'}
                    </Badge>
                  </div>
                </div>

                {/* Komponen KPI */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-800 block">Komponen KPI</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Komponen</TableHead>
                        <TableHead className="text-xs text-center">Score</TableHead>
                        <TableHead className="text-xs text-center">Bobot (%)</TableHead>
                        <TableHead className="text-xs text-center">Kontribusi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Presensi</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-500 text-white text-xs">{selectedMonthlyKpi.scorePresensi}%</Badge>
                        </TableCell>
                        <TableCell className="text-center">{selectedMonthlyKpi.bobotPresensi}%</TableCell>
                        <TableCell className="text-center font-medium">{(parseFloat(selectedMonthlyKpi.scorePresensi) * selectedMonthlyKpi.bobotPresensi / 100).toFixed(2)}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Pelatihan</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-purple-500 text-white text-xs">{selectedMonthlyKpi.scorePelatihan}%</Badge>
                        </TableCell>
                        <TableCell className="text-center">{selectedMonthlyKpi.bobotPelatihan}%</TableCell>
                        <TableCell className="text-center font-medium">{(selectedMonthlyKpi.scorePelatihan * selectedMonthlyKpi.bobotPelatihan / 100).toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Perhitungan Final */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <Label className="text-sm font-semibold text-gray-800 mb-2 block">Perhitungan Final</Label>
                  <div className="font-bold text-2xl text-blue-600">
                    KPI Final = {selectedMonthlyKpi.kpiFinal ? selectedMonthlyKpi.kpiFinal.toFixed(2) + '%' : '-'}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN - Detail Indikator Lain */}
              <div className="space-y-4 border-l pl-6">
                <div>
                  <Label className="text-base font-semibold text-gray-800 mb-3 block">Detail Indikator Lain</Label>
                  
                  {monthlyKpiDetail.kpiDetails && monthlyKpiDetail.kpiDetails.length > 0 ? (
                    <div className="space-y-3">
                      {monthlyKpiDetail.kpiDetails.map((detail: any) => (
                        <div key={detail.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs text-muted-foreground">Indikator</Label>
                              <Badge className="bg-green-500 text-white text-xs">
                                {detail.score != null ? detail.score.toFixed(1) + '%' : '-'}
                              </Badge>
                            </div>
                            <div className="font-bold text-base text-gray-900">{detail.indikator?.nama || '-'}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <Label className="text-xs text-muted-foreground">Bobot</Label>
                              <div className="font-semibold">{detail.indikator?.bobot ? (detail.indikator.bobot * 100).toFixed(0) + '%' : '-'}</div>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">Kontribusi</Label>
                              <div className="font-semibold">{detail.score != null && detail.indikator?.bobot ? (detail.score * detail.indikator.bobot).toFixed(2) : '-'}</div>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">Target</Label>
                              <div className="font-semibold">{detail.target || '-'}</div>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">Realisasi</Label>
                              <div className="font-semibold">{detail.realisasi ?? '-'}</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Summary Box */}
                      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Total Bobot Indikator Lain</Label>
                            <div className="font-bold text-xl text-purple-600">{selectedMonthlyKpi.totalBobotIndikatorLain}%</div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">KPI Indikator Lain</Label>
                            <div className="font-bold text-xl text-purple-600">{selectedMonthlyKpi.kpiIndikatorLain.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-sm text-muted-foreground">Tidak ada indikator lain yang terdaftar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" onClick={() => setMonthlyDetailDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus KPI ini? Tindakan ini tidak dapat dibatalkan.
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

      {/* Direct Detail Update Dialog */}
      <Dialog open={isDirectDetailUpdateOpen} onOpenChange={setIsDirectDetailUpdateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Detail KPI</DialogTitle>
            <DialogDescription>
              Update target dan realisasi untuk detail KPI {editingMonthlyKpi?.namaKaryawan}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDirectDetailUpdate}>
            <div className="space-y-4 py-4">
              {editingMonthlyKpi && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm text-gray-500">Karyawan</Label>
                    <p className="font-medium">{editingMonthlyKpi.namaKaryawan}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Departemen</Label>
                    <p className="font-medium">{editingMonthlyKpi.departemen}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Periode</Label>
                    <p className="font-medium">
                      {getMonthName(editingMonthlyKpi.bulan)} {editingMonthlyKpi.tahun}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Detail ID</Label>
                    <p className="font-medium text-xs">{editingDetailId}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={directDetailForm.target}
                    onChange={(e) => setDirectDetailForm({ ...directDetailForm, target: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Realisasi</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="95"
                    value={directDetailForm.realisasi}
                    onChange={(e) => setDirectDetailForm({ ...directDetailForm, realisasi: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periode Tahun</Label>
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    value={directDetailForm.periodeYear}
                    onChange={(e) => setDirectDetailForm({ ...directDetailForm, periodeYear: parseInt(e.target.value) || new Date().getFullYear() })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Periode Bulan (1-12)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={directDetailForm.periodeMonth}
                    onChange={(e) => setDirectDetailForm({ ...directDetailForm, periodeMonth: parseInt(e.target.value) || 1 })}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDirectDetailDialog}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Detail
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update KPI Details Dialog */}
      <Dialog open={isUpdateDetailDialogOpen} onOpenChange={setIsUpdateDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Detail KPI</DialogTitle>
            <DialogDescription>
              Update target dan realisasi untuk setiap indikator KPI
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateDetails}>
            <div className="space-y-4 py-4">
              {editingKpiForUpdate && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm text-gray-500">Karyawan</Label>
                    <p className="font-medium">{editingKpiForUpdate.karyawan.nama}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Tahun</Label>
                    <p className="font-medium">{editingKpiForUpdate.year}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Periode</Label>
                    <p className="font-medium">
                      {editingKpiForUpdate.periodeMonth && editingKpiForUpdate.periodeYear
                        ? `${getMonthName(editingKpiForUpdate.periodeMonth.toString().padStart(2, '0'))} ${editingKpiForUpdate.periodeYear}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Departemen</Label>
                    <p className="font-medium">{editingKpiForUpdate.karyawan.departemen[0]?.nama || '-'}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Detail Indikator KPI</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const newDetails = [...formData.kpiDetails, { 
                        indikatorId: '', 
                        target: '', 
                        realisasi: '',
                        periodeYear: formData.periodeYear,
                        periodeMonth: formData.periodeMonth
                      }];
                      setFormData({ ...formData, kpiDetails: newDetails });
                    }} 
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Tambah Indikator
                  </Button>
                </div>

                {formData.kpiDetails.map((detail, index) => {
                  const indicator = indicators.find(ind => ind.id === detail.indikatorId);
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Label className="text-base font-semibold">{indicator?.nama || 'Indikator'}</Label>
                              <p className="text-sm text-gray-500">{indicator?.deskripsi || ''}</p>
                              <Badge variant="secondary" className="mt-1">
                                Bobot: {indicator?.bobot ? (indicator.bobot * 100).toFixed(0) + '%' : '-'}
                              </Badge>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                const newDetails = [...formData.kpiDetails];
                                newDetails.splice(index, 1);
                                setFormData({ ...formData, kpiDetails: newDetails });
                              }} 
                              disabled={submitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label>Indikator <span className="text-red-500">*</span></Label>
                            <Select
                              value={detail.indikatorId}
                              onValueChange={(value) => {
                                const newDetails = [...formData.kpiDetails];
                                newDetails[index] = { ...newDetails[index], indikatorId: value };
                                setFormData({ ...formData, kpiDetails: newDetails });
                              }}
                              disabled={submitting}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih indikator" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredIndicators.map((indicator) => (
                                  <SelectItem key={indicator.id} value={indicator.id}>
                                    {indicator.nama} ({(indicator.bobot * 100).toFixed(0)}%)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Target <span className="text-red-500">*</span></Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="100"
                                value={detail.target}
                                onChange={(e) => {
                                  const newDetails = [...formData.kpiDetails];
                                  newDetails[index] = { ...newDetails[index], target: e.target.value };
                                  setFormData({ ...formData, kpiDetails: newDetails });
                                }}
                                disabled={submitting}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Realisasi</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="95"
                                value={detail.realisasi}
                                onChange={(e) => {
                                  const newDetails = [...formData.kpiDetails];
                                  newDetails[index] = { ...newDetails[index], realisasi: e.target.value };
                                  setFormData({ ...formData, kpiDetails: newDetails });
                                }}
                                disabled={submitting}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Periode Tahun</Label>
                              <Input
                                type="number"
                                min={2000}
                                max={2100}
                                placeholder="2024"
                                value={detail.periodeYear || ''}
                                onChange={(e) => {
                                  const newDetails = [...formData.kpiDetails];
                                  newDetails[index] = { 
                                    ...newDetails[index], 
                                    periodeYear: e.target.value ? parseInt(e.target.value, 10) : undefined 
                                  };
                                  setFormData({ ...formData, kpiDetails: newDetails });
                                }}
                                disabled={submitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Periode Bulan (1-12)</Label>
                              <Input
                                type="number"
                                min={1}
                                max={12}
                                placeholder="1-12"
                                value={detail.periodeMonth || ''}
                                onChange={(e) => {
                                  const newDetails = [...formData.kpiDetails];
                                  newDetails[index] = { 
                                    ...newDetails[index], 
                                    periodeMonth: e.target.value ? parseInt(e.target.value, 10) : undefined 
                                  };
                                  setFormData({ ...formData, kpiDetails: newDetails });
                                }}
                                disabled={submitting}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseUpdateDetailDialog}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update KPI Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
