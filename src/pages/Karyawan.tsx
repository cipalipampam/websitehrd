import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { karyawanAPI, departemenAPI, jabatanAPI } from "../services/api";
import type { Karyawan as KaryawanType } from "../types/karyawan";
import type { Departemen } from "../types/departemen";
import type { Jabatan } from "../types/jabatan";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { AxiosError } from "axios";

interface AlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

interface KaryawanFormData {
  username: string;
  email: string;
  password: string;
  nama: string;
  gender: string;
  alamat: string;
  no_telp: string;
  tanggal_lahir: string;
  pendidikan: string;
  tanggal_masuk: string;
  jalur_rekrut: string;
  departemenId: string;
  jabatanId: string;
}

export const Karyawan = () => {
  const [karyawan, setKaryawan] = useState<KaryawanType[]>([]);
  const [departemen, setDepartemen] = useState<Departemen[]>([]);
  const [jabatan, setJabatan] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingKaryawan, setEditingKaryawan] = useState<KaryawanType | null>(
    null
  );
  const [viewingKaryawan, setViewingKaryawan] = useState<KaryawanType | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<KaryawanFormData>({
    username: "",
    email: "",
    password: "",
    nama: "",
    gender: "",
    alamat: "",
    no_telp: "",
    tanggal_lahir: "",
    pendidikan: "",
    tanggal_masuk: "",
    jalur_rekrut: "",
    departemenId: "",
    jabatanId: "",
  });
  const [submitting, setSubmitting] = useState(false);
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

  const fetchKaryawan = async () => {
    try {
      setLoading(true);
      const response = await karyawanAPI.getAll();
      console.log("Fetched karyawan:", response.data);
      setKaryawan(response.data);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Gagal memuat data karyawan"
          : "Gagal memuat data karyawan";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartemen = async () => {
    try {
      const response = await departemenAPI.getAll();
      setDepartemen(response.data);
    } catch (error) {
      console.error("Error fetching departemen:", error);
    }
  };

  const fetchJabatan = async () => {
    try {
      const response = await jabatanAPI.getAll();
      setJabatan(response.data);
    } catch (error) {
      console.error("Error fetching jabatan:", error);
    }
  };

  useEffect(() => {
    fetchKaryawan();
    fetchDepartemen();
    fetchJabatan();
  }, []);

 const handleOpenDialog = (karyawan?: KaryawanType) => {
  if (karyawan) {
    console.log("Editing karyawan:", karyawan);
    setEditingKaryawan(karyawan);
    setFormData({
      username: karyawan.user?.username || "",
      email: karyawan.user?.email || "",
      password: "", // Password tidak di-set saat edit
      nama: karyawan.nama,
      gender: karyawan.gender,
      alamat: karyawan.alamat,
      no_telp: karyawan.no_telp,
      tanggal_lahir: karyawan.tanggal_lahir
        ? new Date(karyawan.tanggal_lahir).toISOString().split("T")[0]
        : "",
      pendidikan: karyawan.pendidikan,
      tanggal_masuk: karyawan.tanggal_masuk
        ? new Date(karyawan.tanggal_masuk).toISOString().split("T")[0]
        : "",
      jalur_rekrut: karyawan.jalur_rekrut,
      // PERBAIKAN: Ambil ID dari array departemen dan jabatan
      departemenId: karyawan.departemen?.[0]?.id || "",
      jabatanId: karyawan.jabatan?.[0]?.id || "",
    });
  } else {
    console.log("Creating new karyawan");
    setEditingKaryawan(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      nama: "",
      gender: "",
      alamat: "",
      no_telp: "",
      tanggal_lahir: "",
      pendidikan: "",
      tanggal_masuk: "",
      jalur_rekrut: "",
      departemenId: "",
      jabatanId: "",
    });
  }
  setIsDialogOpen(true);
};

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingKaryawan(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      nama: "",
      gender: "",
      alamat: "",
      no_telp: "",
      tanggal_lahir: "",
      pendidikan: "",
      tanggal_masuk: "",
      jalur_rekrut: "",
      departemenId: "",
      jabatanId: "",
    });
  };

  const handleViewDetail = (karyawan: KaryawanType) => {
    setViewingKaryawan(karyawan);
    setIsDetailDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!formData.nama.trim()) {
      showAlert("error", "Nama karyawan wajib diisi");
      return;
    }

    if (!editingKaryawan) {
      // Validasi untuk create
      if (
        !formData.username.trim() ||
        !formData.email.trim() ||
        !formData.password.trim()
      ) {
        showAlert("error", "Username, email, dan password wajib diisi");
        return;
      }
    }

    try {
      setSubmitting(true);
      if (editingKaryawan) {
        console.log("Submitting update for ID:", editingKaryawan.id);

        if (!editingKaryawan.id) {
          throw new Error("ID karyawan tidak ditemukan");
        }

        // Data untuk update (tanpa username, email, password)
        const updateData = {
          nama: formData.nama,
          gender: formData.gender,
          alamat: formData.alamat,
          no_telp: formData.no_telp,
          tanggal_lahir: formData.tanggal_lahir,
          pendidikan: formData.pendidikan,
          tanggal_masuk: formData.tanggal_masuk,
          jalur_rekrut: formData.jalur_rekrut,
          departemenId: formData.departemenId || null,
          jabatanId: formData.jabatanId || null,
        };

        await karyawanAPI.update(editingKaryawan.id, updateData);
        showAlert("success", "Karyawan berhasil diupdate");
      } else {
        console.log("Submitting new karyawan");
        await karyawanAPI.create(formData);
        showAlert("success", "Karyawan berhasil ditambahkan");
      }
      handleCloseDialog();
      fetchKaryawan();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Terjadi kesalahan"
          : error instanceof Error
          ? error.message
          : "Terjadi kesalahan";
      showAlert("error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSubmitting(true);
      console.log("Deleting karyawan ID:", deletingId);
      await karyawanAPI.delete(deletingId);
      showAlert("success", "Karyawan berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchKaryawan();
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Gagal menghapus karyawan"
          : "Gagal menghapus karyawan";
      showAlert("error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    console.log("Opening delete dialog for ID:", id);
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Karyawan</h1>
              <p className="text-gray-500 mt-1">
                Kelola data karyawan perusahaan
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Karyawan
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Karyawan</CardTitle>
              <CardDescription>
                Menampilkan semua karyawan yang terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : karyawan.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data karyawan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead>Departemen</TableHead>
                        <TableHead>No. Telepon</TableHead>
                        <TableHead>Tanggal Masuk</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {karyawan.map((k, index) => (
                        <TableRow key={k.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {k.nama}
                          </TableCell>
                          <TableCell>{k.user?.email || "-"}</TableCell>
                          <TableCell>{k.jabatan?.[0]?.nama || "-"}</TableCell>
                          <TableCell>
                            {k.departemen?.[0]?.nama || "-"}
                          </TableCell>
                          <TableCell>{k.no_telp}</TableCell>
                          <TableCell>{formatDate(k.tanggal_masuk)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(k)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(k)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDeleteDialog(k.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingKaryawan ? "Edit Karyawan" : "Tambah Karyawan"}
            </DialogTitle>
            <DialogDescription>
              {editingKaryawan
                ? `Update informasi karyawan (ID: ${editingKaryawan.id})`
                : "Tambahkan karyawan baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* User Information - Only for create */}
              {!editingKaryawan && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm">Informasi Akun</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">
                        Username <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="username"
                        placeholder="Masukkan username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Masukkan email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Masukkan password "
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informasi Pribadi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="nama">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nama"
                      placeholder="Masukkan nama lengkap"
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pria">Laki-laki</SelectItem>
                        <SelectItem value="Wanita">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    <Input
                      id="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggal_lahir: e.target.value,
                        })
                      }
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_telp">No. Telepon</Label>
                    <Input
                      id="no_telp"
                      placeholder="Masukkan no. telepon"
                      value={formData.no_telp}
                      onChange={(e) =>
                        setFormData({ ...formData, no_telp: e.target.value })
                      }
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pendidikan">Pendidikan</Label>
                    <Select
                      value={formData.pendidikan}
                      onValueChange={(value) =>
                        setFormData({ ...formData, pendidikan: value })
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SD">SD</SelectItem>
                        <SelectItem value="SMP">SMP</SelectItem>
                        <SelectItem value="SMA">SMA/SMK</SelectItem>
                        <SelectItem value="D3">D3</SelectItem>
                        <SelectItem value="S1">S1</SelectItem>
                        <SelectItem value="S2">S2</SelectItem>
                        <SelectItem value="S3">S3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Input
                      id="alamat"
                      placeholder="Masukkan alamat lengkap"
                      value={formData.alamat}
                      onChange={(e) =>
                        setFormData({ ...formData, alamat: e.target.value })
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informasi Pekerjaan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departemenId">Departemen</Label>
                    <Select
                      value={formData.departemenId || "none"}
                      onValueChange={(value) =>
                        setFormData({ 
                          ...formData, 
                          departemenId: value === "none" ? "" : value 
                        })
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {departemen.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jabatanId">Jabatan</Label>
                    <Select
                      value={formData.jabatanId || "none"}
                      onValueChange={(value) =>
                        setFormData({ 
                          ...formData, 
                          jabatanId: value === "none" ? "" : value 
                        })
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {jabatan.map((jab) => (
                          <SelectItem key={jab.id} value={jab.id}>
                            {jab.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_masuk">Tanggal Masuk</Label>
                    <Input
                      id="tanggal_masuk"
                      type="date"
                      value={formData.tanggal_masuk}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggal_masuk: e.target.value,
                        })
                      }
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jalur_rekrut">Jalur Rekrutmen</Label>
                    <Select
                      value={formData.jalur_rekrut}
                      onValueChange={(value) =>
                        setFormData({ ...formData, jalur_rekrut: value })
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jalur rekrutmen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internal">Internal</SelectItem>
                        <SelectItem value="Eksternal">Eksternal</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Campus Hiring">
                          Campus Hiring
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingKaryawan ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Karyawan</DialogTitle>
            <DialogDescription>Informasi lengkap karyawan</DialogDescription>
          </DialogHeader>
          {viewingKaryawan && (
            <div className="space-y-6 py-4">
              {/* Informasi Akun */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm border-b pb-2">
                  Informasi Akun
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Username</p>
                    <p className="font-medium">
                      {viewingKaryawan.user?.username || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">
                      {viewingKaryawan.user?.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <p className="font-medium">
                      {viewingKaryawan.user?.role || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informasi Pribadi */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm border-b pb-2">
                  Informasi Pribadi
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nama Lengkap</p>
                    <p className="font-medium">{viewingKaryawan.nama}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jenis Kelamin</p>
                    <p className="font-medium">
                      {viewingKaryawan.gender === "Pria"
                        ? "Laki-laki"
                        : "Perempuan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Lahir</p>
                    <p className="font-medium">
                      {formatDate(viewingKaryawan.tanggal_lahir)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Umur</p>
                    <p className="font-medium">
                      {viewingKaryawan.umur || 0} tahun
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">No. Telepon</p>
                    <p className="font-medium">{viewingKaryawan.no_telp}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pendidikan</p>
                    <p className="font-medium">{viewingKaryawan.pendidikan}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Alamat</p>
                    <p className="font-medium">{viewingKaryawan.alamat}</p>
                  </div>
                </div>
              </div>

              {/* Informasi Pekerjaan */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm border-b pb-2">
                  Informasi Pekerjaan
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Departemen</p>
                    <p className="font-medium">
                      {viewingKaryawan.departemen?.[0]?.nama || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jabatan</p>
                    <p className="font-medium">
                      {viewingKaryawan.jabatan?.[0]?.nama || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Masuk</p>
                    <p className="font-medium">
                      {formatDate(viewingKaryawan.tanggal_masuk)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Masa Kerja</p>
                    <p className="font-medium">
                      {viewingKaryawan.masaKerja || 0} tahun
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jalur Rekrutmen</p>
                    <p className="font-medium">
                      {viewingKaryawan.jalur_rekrut}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setIsDetailDialogOpen(false)}>
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
              Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak
              dapat dibatalkan dan akan menghapus semua data terkait.
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