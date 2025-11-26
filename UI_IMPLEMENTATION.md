# UI Implementation Summary - Opsi A (Jabatan per Departemen)

## Perubahan yang Dilakukan

### 1. **Types Update** (`src/types/jabatan.ts`)

**Field Baru:**
```typescript
export interface Jabatan {
  id: string;
  nama: string;
  departemenId: string;        // NEW: Required FK
  level?: string;              // NEW: Optional (Junior/Staff/Senior/Lead/Manager/Director)
  deskripsi?: string;          // NEW: Optional description
  departemen: {                // NEW: Relation object
    id: string;
    nama: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface JabatanCreateRequest {
  nama: string;
  departemenId: string;        // Required
  level?: string;
  deskripsi?: string;
}

export interface JabatanUpdateRequest {
  nama?: string;
  departemenId?: string;
  level?: string;
  deskripsi?: string;
}
```

---

### 2. **API Service Update** (`src/services/api.ts`)

**Method Baru:**
```typescript
export const jabatanAPI = {
  // Support filter by department
  getAll: async (params?: { departemenId?: string }): Promise<JabatanResponse> => {
    const response = await api.get<JabatanResponse>('/api/jabatan', { params });
    return response.data;
  },

  // Helper method untuk get jabatan by departemen
  getByDepartemen: async (departemenId: string): Promise<JabatanResponse> => {
    const response = await api.get<JabatanResponse>('/api/jabatan', { 
      params: { departemenId } 
    });
    return response.data;
  },

  // Create & Update sudah support field baru
  create: async (data: JabatanCreateRequest): Promise<JabatanSingleResponse>,
  update: async (id: string, data: JabatanUpdateRequest): Promise<JabatanSingleResponse>,
  delete: async (id: string): Promise<{ status: number; message: string }>,
};
```

---

### 3. **Halaman Jabatan** (`src/pages/Jabatan.tsx`)

#### A. State Baru
```typescript
const [departemen, setDepartemen] = useState<Departemen[]>([]);
const [filterDepartemen, setFilterDepartemen] = useState<string>('');
const [formData, setFormData] = useState({ 
  nama: '', 
  departemenId: '',   // Required
  level: '',          // Optional
  deskripsi: ''       // Optional
});
```

#### B. Filter by Department
**UI Component:**
- Dropdown filter untuk memfilter jabatan berdasarkan departemen
- Button "Reset" untuk clear filter
- Auto-refresh table saat filter berubah

**Code:**
```typescript
useEffect(() => {
  fetchJabatan();
}, [filterDepartemen]);

const fetchJabatan = async () => {
  const params = filterDepartemen ? { departemenId: filterDepartemen } : undefined;
  const response = await jabatanAPI.getAll(params);
  setJabatan(response.data);
};
```

#### C. Table Display
**Kolom Baru:**
- **Level**: Badge biru menampilkan level jabatan
- **Departemen**: Badge abu-abu menampilkan nama departemen
- **Deskripsi**: Text truncated dengan max-width

**Tampilan:**
```
No | Nama Jabatan        | Level    | Departemen  | Deskripsi          | Aksi
1  | Software Engineer   | [Staff]  | [Technology]| Develop software   | ✏️ 🗑️
2  | HR Manager         | [Manager]| [HR]        | Manage HR team     | ✏️ 🗑️
```

#### D. Form Dialog
**Fields:**
1. **Departemen*** (Required) - Select dropdown
2. **Nama Jabatan*** (Required) - Text input
3. **Level** (Optional) - Select dropdown (Junior/Staff/Senior/Lead/Manager/Director)
4. **Deskripsi** (Optional) - Textarea (3 rows)

**Validasi:**
- Nama jabatan wajib diisi
- Departemen wajib dipilih
- Backend akan validate duplicate (nama, departemenId)

---

### 4. **Halaman Karyawan** (`src/pages/Karyawan.tsx`)

#### A. Dependent Dropdown Implementation

**Logic:**
```typescript
// Fetch jabatan when departemenId changes
useEffect(() => {
  if (formData.departemenId) {
    fetchJabatan(formData.departemenId);  // Filter by selected department
    
    // Reset jabatanId if department changes and current jabatan not in new department
    if (formData.jabatanId) {
      const selectedJabatan = jabatan.find(j => j.id === formData.jabatanId);
      if (selectedJabatan && selectedJabatan.departemenId !== formData.departemenId) {
        setFormData(prev => ({ ...prev, jabatanId: '' }));
      }
    }
  } else {
    setJabatan([]);
  }
}, [formData.departemenId]);
```

**Fetch Function:**
```typescript
const fetchJabatan = async (departemenId?: string) => {
  try {
    const params = departemenId ? { departemenId } : undefined;
    const response = await jabatanAPI.getAll(params);
    setJabatan(response.data);
  } catch (error) {
    console.error("Error fetching jabatan:", error);
    setJabatan([]);
  }
};
```

#### B. Form UI

**Departemen Field:**
- Required field (marked with red asterisk)
- Standard Select component
- Placeholder: "Pilih departemen terlebih dahulu"

**Jabatan Field:**
- Required field (marked with red asterisk)
- **DISABLED** until departemen selected
- Placeholder changes based on state:
  - No department: "Pilih departemen dulu"
  - Department selected: "Pilih jabatan"
  - No jabatan available: Shows "Tidak ada jabatan untuk departemen ini"
- Display format: `{nama} ({level})` - e.g., "Software Engineer (Staff)"

**Warning Message:**
```typescript
{formData.departemenId && jabatan.length === 0 && (
  <p className="text-xs text-yellow-600">
    Tidak ada jabatan tersedia untuk departemen ini
  </p>
)}
```

#### C. Table Display Enhancement

**Jabatan Column:**
- Menampilkan nama jabatan
- Badge level (jika ada) dengan styling biru

**Departemen Column:**
- Badge abu-abu dengan nama departemen
- Compact display

**Code:**
```tsx
<TableCell>
  {k.jabatan?.[0] ? (
    <div className="flex flex-col gap-1">
      <span>{k.jabatan[0].nama}</span>
      {k.jabatan[0].level && (
        <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {k.jabatan[0].level}
        </span>
      )}
    </div>
  ) : "-"}
</TableCell>
<TableCell>
  {k.departemen?.[0]?.nama ? (
    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      {k.departemen[0].nama}
    </span>
  ) : "-"}
</TableCell>
```

---

## Testing Checklist

### Halaman Jabatan

#### ✅ Read Operations
- [ ] Load semua jabatan (tanpa filter)
- [ ] Filter jabatan by departemen
- [ ] Reset filter kembali ke semua jabatan
- [ ] Display level dan departemen di table
- [ ] Display deskripsi (truncated)

#### ✅ Create Operations
- [ ] Form validation: nama wajib diisi
- [ ] Form validation: departemen wajib dipilih
- [ ] Create jabatan dengan level
- [ ] Create jabatan tanpa level (optional)
- [ ] Create jabatan dengan deskripsi
- [ ] Error handling: duplicate nama di departemen sama
- [ ] Success: duplicate nama di departemen berbeda

#### ✅ Update Operations
- [ ] Edit jabatan: form pre-fill dengan data existing
- [ ] Update nama jabatan
- [ ] Update departemen (pindah jabatan ke dept lain)
- [ ] Update level
- [ ] Update deskripsi
- [ ] Error handling: duplicate constraint saat update

#### ✅ Delete Operations
- [ ] Delete jabatan
- [ ] Confirmation dialog muncul
- [ ] Error handling jika jabatan masih digunakan karyawan

---

### Halaman Karyawan

#### ✅ Dependent Dropdown
- [ ] Initial: Jabatan dropdown disabled
- [ ] Select departemen → Jabatan dropdown enabled
- [ ] Select departemen → Jabatan dropdown populated dengan roles dari dept tersebut
- [ ] Change departemen → Jabatan dropdown di-reset
- [ ] Change departemen → Jabatan baru loaded dari dept baru
- [ ] Display format jabatan: "Nama Jabatan (Level)"
- [ ] Warning message jika departemen tidak punya jabatan

#### ✅ Create Karyawan
- [ ] Validation: departemen required
- [ ] Validation: jabatan required
- [ ] Create karyawan dengan jabatan yang memiliki level
- [ ] Success message dan refresh data

#### ✅ Edit Karyawan
- [ ] Form pre-fill: departemen dan jabatan existing
- [ ] Change departemen → jabatan dropdown updated
- [ ] Update departemen dan jabatan
- [ ] Update jabatan dalam departemen yang sama

#### ✅ Table Display
- [ ] Jabatan column: tampilkan nama
- [ ] Jabatan column: tampilkan level badge (jika ada)
- [ ] Departemen column: tampilkan badge
- [ ] Badge styling: blue untuk level, gray untuk departemen

---

## User Flow Examples

### 1. Create Jabatan Baru
1. Click "Tambah Jabatan"
2. Pilih Departemen: "Technology"
3. Isi Nama: "DevOps Engineer"
4. Pilih Level: "Senior"
5. Isi Deskripsi: "Manage CI/CD pipelines..."
6. Click "Simpan"
7. ✅ Success: "Jabatan berhasil ditambahkan"

### 2. Filter Jabatan by Department
1. Buka halaman Jabatan
2. Di filter dropdown, pilih "Technology"
3. Table otomatis filtered, hanya tampil Technology roles
4. Click "Reset" → kembali tampil semua jabatan

### 3. Create Karyawan dengan Dependent Dropdown
1. Click "Tambah Karyawan"
2. Isi data personal (nama, email, dll)
3. **Pilih Departemen: "HR"**
4. Jabatan dropdown enabled, tampil: "HR Manager (Manager)", "HR Specialist (Staff)", dst
5. **Pilih Jabatan: "HR Manager (Manager)"**
6. Isi data lainnya
7. Click "Simpan"
8. ✅ Karyawan created dengan departemen HR dan jabatan HR Manager

### 4. Edit Karyawan - Pindah Departemen
1. Click edit pada karyawan "John Doe" (Current: Technology - Software Engineer)
2. **Change Departemen: "Technology" → "Sales & Marketing"**
3. Jabatan dropdown auto-reset dan reload dengan Sales roles
4. Jabatan options: "Sales Manager (Manager)", "Account Executive (Staff)", dst
5. **Pilih Jabatan: "Account Executive (Staff)"**
6. Click "Update"
7. ✅ Karyawan updated, sekarang di Sales dept dengan jabatan Account Executive

---

## Error Handling

### Jabatan Page

**Error:** Duplicate nama di departemen sama
```
❌ Jabatan with nama 'Software Engineer' already exists in this departemen
```

**Error:** Departemen tidak dipilih
```
❌ Departemen wajib dipilih
```

**Error:** Nama jabatan kosong
```
❌ Nama jabatan wajib diisi
```

### Karyawan Page

**Error:** Departemen tidak dipilih
```
❌ Departemen wajib dipilih
```

**Error:** Jabatan tidak dipilih
```
❌ Jabatan wajib dipilih
```

**Warning:** Departemen tidak punya jabatan
```
⚠️ Tidak ada jabatan tersedia untuk departemen ini
```

---

## Visual Design

### Badges

**Level Badge:**
- Background: `bg-blue-50`
- Text: `text-blue-700`
- Ring: `ring-blue-700/10`
- Size: `text-xs`

**Departemen Badge:**
- Background: `bg-gray-50`
- Text: `text-gray-600`
- Ring: `ring-gray-500/10`
- Size: `text-xs`

### Form Layout

**Jabatan Form:**
```
┌─────────────────────────────────┐
│ Departemen *      [Select ▼]   │
│ Nama Jabatan *    [Input]      │
│ Level            [Select ▼]    │
│ Deskripsi        [Textarea]    │
│                                 │
│         [Batal]  [Simpan]      │
└─────────────────────────────────┘
```

**Karyawan Form - Employment Section:**
```
┌─────────────────────────────────┐
│ Departemen *     Jabatan *      │
│ [Select ▼]      [Select ▼]     │
│                 ⚠️ Warning msg   │
│                                 │
│ Tanggal Masuk   Jalur Rekrut   │
│ [Date]          [Select ▼]     │
└─────────────────────────────────┘
```

---

## Next Steps (Optional Enhancements)

### 1. **Bulk Operations**
- Bulk import jabatan dari CSV/Excel
- Bulk assign jabatan ke karyawan

### 2. **Advanced Filtering**
- Filter karyawan by departemen
- Filter karyawan by level jabatan
- Search jabatan by nama atau deskripsi

### 3. **Reporting**
- Laporan distribusi karyawan per departemen
- Laporan struktur organisasi
- Chart: Jumlah karyawan per level

### 4. **Validation Enhancement**
- Prevent delete departemen yang masih punya jabatan
- Prevent delete jabatan yang masih assigned ke karyawan
- Warning message dengan jumlah affected records

### 5. **UX Improvements**
- Autocomplete untuk jabatan search
- Drag-and-drop untuk reorder jabatan
- Quick edit inline di table
- Bulk edit level jabatan

---

## Summary

✅ **Completed:**
- Types updated dengan field baru (departemenId, level, deskripsi, departemen)
- API service support filter by departemenId
- Jabatan page: Filter dropdown, enhanced table, complete form
- Karyawan page: Dependent dropdown (departemen → jabatan)
- Visual enhancements: badges untuk level dan departemen
- Error handling untuk all CRUD operations

🎯 **Key Features:**
1. **One-to-Many Relationship**: Setiap jabatan belongs to one departemen
2. **Composite Unique Constraint**: Nama jabatan bisa sama di departemen berbeda
3. **Dependent Dropdown**: User harus pilih departemen dulu sebelum pilih jabatan
4. **Filter Support**: Filter jabatan by departemen di halaman Jabatan
5. **Level System**: Optional level field (Junior/Staff/Senior/Lead/Manager/Director)
6. **Enhanced Display**: Table menampilkan departemen dan level dengan badges

📊 **Data Flow:**
```
User selects Departemen
    ↓
Frontend calls: jabatanAPI.getAll({ departemenId })
    ↓
Backend filters: WHERE departemenId = ?
    ↓
Returns jabatan for that department only
    ↓
Populate Jabatan dropdown
```

🔗 **Related Documentation:**
- Backend: `MIGRATION_JABATAN.md`, `OPSI_A_SUMMARY.md`, `API_TEST_MANUAL.md`
- Types: `src/types/jabatan.ts`
- Services: `src/services/api.ts`
- Pages: `src/pages/Jabatan.tsx`, `src/pages/Karyawan.tsx`
