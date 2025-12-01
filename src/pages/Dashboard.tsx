// src/pages/Dashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../stores/authStore';
import { departemenAPI, kehadiranAPI, karyawanAPI, kpiAPI } from '../services/api';
import type { Kehadiran } from '../types/kehadiran';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Building2,
  Calculator,
  DollarSign,
  Laptop,
  Users,
  Briefcase,
  Heart,
  Wrench,
  BookOpen,
  Shield,
  Truck,
  Phone
} from 'lucide-react';

const departmentColors: Record<string, string> = {
  Analytics: '#8884d8',
  Finance: '#82ca9d',
  HR: '#ffc658',
  Operations: '#ff7300',
  Procurement: '#8dd1e1',
  'R&D': '#d084d8',
  'Sales & Marketing': '#82d982',
  Technology: '#ff8042',
};

const ratingColors: Record<string, string> = {
  Excellent: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  Good: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Average: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  Poor: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
};

const getDepartmentIcon = (departmentName: string) => {
  const name = departmentName.toLowerCase();
  
  if (name.includes('analytic') || name.includes('data')) return Calculator;
  if (name.includes('finance') || name.includes('keuangan')) return DollarSign;
  if (name.includes('technology') || name.includes('it') || name.includes('teknologi')) return Laptop;
  if (name.includes('hr') || name.includes('human') || name.includes('sdm')) return Users;
  if (name.includes('marketing') || name.includes('pemasaran')) return Briefcase;
  if (name.includes('operation') || name.includes('operasi')) return Wrench;
  if (name.includes('legal') || name.includes('hukum')) return Shield;
  if (name.includes('sales') || name.includes('penjualan')) return Phone;
  if (name.includes('support') || name.includes('dukungan')) return Heart;
  if (name.includes('research') || name.includes('riset') || name.includes('r&d')) return BookOpen;
  if (name.includes('production') || name.includes('produksi')) return Building2;
  if (name.includes('logistic') || name.includes('logistik')) return Truck;
  if (name.includes('procurement')) return Briefcase;
  
  return Building2; // Default icon
};

// Trend Icon Component
const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-green-600 dark:text-green-400">UP</span>
      </div>
    );
  }

  if (trend === 'down') {
    return (
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-red-600 dark:text-red-400">DOWN</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">STABLE</span>
    </div>
  );
};

export const Dashboard = () => {
  const { user, fetchUser } = useAuthStore();

  // Get current date for default filters
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11 (December = 11)
  const currentYear = currentDate.getFullYear();

  // Selection & UI state
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('Semua Departemen');
  const [selectedAttendanceDepartment, setSelectedAttendanceDepartment] = useState('Analytics');
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(currentMonth);
  const [selectedAttendanceYear, setSelectedAttendanceYear] = useState(currentYear);

  // Data states
  const [departments, setDepartments] = useState<string[]>([]);
  const [karyawan, setKaryawan] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Kehadiran[]>([]);
  const [kpiBulanan, setKpiBulanan] = useState<any[]>([]);
  const [kpiKaryawan, setKpiKaryawan] = useState<any[]>([]); // Employee KPI data from karyawan endpoint

  // Loading/error states
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [errorAttendance, setErrorAttendance] = useState<string | null>(null);
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [needleAnimation, setNeedleAnimation] = useState({ annual: false, monthly: false });
  
  // KPI Detail Popup states
  const [showKpiDetailPopup, setShowKpiDetailPopup] = useState(false);
  const [selectedDepartmentForDetail, setSelectedDepartmentForDetail] = useState<string>('');

  // Debug logging
  console.log('=== DASHBOARD STATE DEBUG ===');
  console.log('Dashboard state:', {
    kpiBulananLength: kpiBulanan.length,
    departmentsLength: departments.length,
    karyawanLength: karyawan.length,
    loadingKpi,
    loadingAttendance
  });
  console.log('KPI Bulanan Raw Data:', kpiBulanan);
  console.log('KPI Karyawan Raw Data:', kpiKaryawan);
  console.log('Departments Array:', departments);
  console.log('Selected Departments:', selectedDepartments);
  console.log('================================');

  // initial load: user, departments, karyawan, kpi
  useEffect(() => {
    fetchUser().catch(console.error);

    // load departemen from API, but will be updated with KPI departments later
    const loadDepartments = async () => {
      try {
        console.log('Loading departments from API...');
        const res = await departemenAPI.getAll();
        console.log('Departments API response:', res);
        
        let deptData = res?.data || res;
        if (!Array.isArray(deptData)) {
          console.log('Department data not array, checking properties:', deptData);
          deptData = (deptData as any)?.data || (deptData as any)?.departments || [];
        }
        
        const allDeptNames = (deptData || []).map((d: any) => d.nama || d.name || d.departemen || 'Unknown Dept');
        console.log('All departments from departemenAPI:', allDeptNames);
        
        // Initially set all departments, will be filtered by KPI data availability later
        console.log('Setting departments:', allDeptNames);
        setDepartments(allDeptNames);
        
        if (allDeptNames.length > 0) {
          const initialSelected = allDeptNames; // Select all departments initially
          console.log('Setting selected departments (all):', initialSelected);
          setSelectedDepartments(initialSelected);
          
          // Auto-select first department if none selected and not 'Semua Departemen'
          if (!selectedEmployeeDepartment || selectedEmployeeDepartment === '') {
            console.log('Setting employee department:', allDeptNames[0]);
            setSelectedEmployeeDepartment(allDeptNames[0]);
          }
          console.log('Setting attendance department:', allDeptNames[0]);
          setSelectedAttendanceDepartment(allDeptNames[0]);
        } else {
          console.log('No departments loaded from API');
        }
      } catch (err) {
        console.error("Failed to load departments", err);
        // No fallback data - if API fails, no departments will be available
        setDepartments([]);
        setSelectedDepartments([]);
        setSelectedEmployeeDepartment('');
        setSelectedAttendanceDepartment('');
      }
    };

    // load karyawan
    const loadKaryawan = async () => {
      try {
        const res = await karyawanAPI.getAll();
        setKaryawan(res.data || []);
      } catch (err) {
        console.error("Failed to load karyawan", err);
      }
    };

    // load KPI bulanan from backend
    const loadKpi = async () => {
      try {
        setLoadingKpi(true);
        console.log('=== API CALL START ===');
        console.log('Calling kpiAPI.getBulanan()...');
        
        // Call the correct KPI bulanan endpoint
        const res = await kpiAPI.getBulanan();
        
        console.log('=== API RESPONSE RECEIVED ===');
        console.log('Full response object:', res);
        console.log('Response status:', res?.status);
        console.log('Response headers:', res?.headers);
        console.log('Response data property:', res?.data);
        console.log('Response type:', typeof res);
        console.log('========================');
        
        // Handle response from kpiAPI.getBulanan() - should return data directly
        let raw = null;
        
        // Since we're using kpiAPI.getBulanan(), the response should be the data directly
        if (Array.isArray(res)) {
          raw = res;
          console.log('Response is direct array from kpiAPI.getBulanan()');
        } else if (res?.data && Array.isArray(res.data)) {
          raw = res.data;
          console.log('Using res.data array');
        } else if (res?.result && Array.isArray(res.result)) {
          raw = res.result;
          console.log('Using res.result array');
        } else if (res?.results && Array.isArray(res.results)) {
          raw = res.results;
          console.log('Using res.results array');
        } else {
          // Try to find any array property in the response
          const responseKeys = Object.keys(res || {});
          console.log('Available response keys:', responseKeys);
          
          for (const key of responseKeys) {
            if (Array.isArray(res[key])) {
              raw = res[key];
              console.log(`Found array data in response[${key}]`);
              break;
            }
          }
          
          if (!raw) {
            raw = res;
            console.log('Using raw response as fallback');
          }
        }
        
        console.log('Extracted raw data:', raw);
        console.log('Raw data type:', typeof raw);
        console.log('Is raw data array?:', Array.isArray(raw));
        
        if (!raw) {
          console.error('No data received from API');
          setKpiBulanan([]);
          return;
        }
        
        if (!Array.isArray(raw)) {
          console.error('Expected array but got:', typeof raw, raw);
          console.log('Attempting to find array in object properties...');
          
          // Try to find array in common property names
          const possibleArrays = ['data', 'items', 'results', 'records', 'kpiData'];
          let foundArray = null;
          
          for (const prop of possibleArrays) {
            if (raw[prop] && Array.isArray(raw[prop])) {
              foundArray = raw[prop];
              console.log(`Found array in property: ${prop}`);
              break;
            }
          }
          
          if (foundArray) {
            raw = foundArray;
          } else {
            console.error('Could not find array data in response');
            setKpiBulanan([]);
            return;
          }
        }
        
        console.log('Processing array with length:', raw.length);
        console.log('Sample items from raw data:', raw.slice(0, 3));
        
        // Process KPI data with new response structure
        const clean = (raw || []).map((x: any, index: number) => {
          console.log(`Processing item ${index}:`, x);
          console.log(`Item keys:`, Object.keys(x));
          
          const processed = {
            // Use new department-level response format
            departemenId: x.departemenId || x.id || `dept-${index}`, // "cbe52d63-6932-4da3-9e90-35bfb3a29d04"
            departemen: x.departemen || x.department || x.nama || 'Unknown', // "HR"
            tahun: Number(x.tahun) || 2025, // 2025
            bulan: x.bulan || x.month || x.periode || '11', // "11"
            kpiFinalDepartemen: Number(x.kpiFinalDepartemen) || 0, // 62.838691357711426
            avgScorePresensi: Number(x.avgScorePresensi) || 0, // 95.5
            avgScorePelatihan: Number(x.avgScorePelatihan) || 0, // 47.5
            avgIndicatorScore: Number(x.avgIndicatorScore) || 0, // 893.3180547353659
            avgIndicatorBobot: Number(x.avgIndicatorBobot) || 0, // 9
            // Employee fields for backward compatibility (if present)
            karyawanId: x.karyawanId || x.employeeId || x.emp_id || null,
            namaKaryawan: x.namaKaryawan || x.employeeName || x.nama || null,
            scorePresensi: Number(x.scorePresensi) || 0,
            scorePelatihan: Number(x.scorePelatihan) || 0,
            bobotPresensi: Number(x.bobotPresensi) || 60,
            bobotPelatihan: Number(x.bobotPelatihan) || 40,
            totalBobotIndikatorLain: Number(x.totalBobotIndikatorLain) || 0,
            totalScoreIndikatorLain: Number(x.totalScoreIndikatorLain) || 0,
            kpiFinal: Number(x.kpiFinal || x.kpiFinalDepartemen) || 0
          };
          
          console.log(`Processed item ${index}:`, processed);
          return processed;
        });
        
        console.log('=== FINAL PROCESSING RESULT ===');
        console.log('Final cleaned data length:', clean.length);
        console.log('Sample processed data:', clean.slice(0, 3));
        console.log('Data structure check:');
        clean.forEach((item, i) => {
          if (i < 5) { // Log first 5 items
            console.log(`Item ${i}:`, {
              departemenId: item.departemenId,
              departemen: item.departemen,
              tahun: item.tahun,
              bulan: item.bulan,
              karyawanId: item.karyawanId,
              namaKaryawan: item.namaKaryawan,
              kpiFinal: item.kpiFinal
            });
          }
        });
        console.log('Departments in data:', [...new Set(clean.map(x => x.departemen))]);
        console.log('Months in data:', [...new Set(clean.map(x => `${x.tahun}-${x.bulan}`))]);
        console.log('Items with karyawanId:', clean.filter(x => x.karyawanId).length);
        console.log('Items with namaKaryawan:', clean.filter(x => x.namaKaryawan).length);
        console.log('Available months in data:', [...new Set(clean.map(x => `${x.tahun}-${x.bulan.toString().padStart(2, '0')}`))].sort());
        console.log('Target month (November 2025):', '2025-11');
        console.log('Current parameters: bulan=11, tahun=2025');
        console.log('==============================');
        
        setKpiBulanan(clean);
        
        // Update departments list with only departments that have KPI data
        const departmentsWithKPI = [...new Set(clean.map((item: any) => item.departemen))];
        console.log('Departments with KPI data:', departmentsWithKPI);
        
        if (departmentsWithKPI.length > 0) {
          setDepartments(departmentsWithKPI);
          // Update selected departments to include all departments with KPI data
          setSelectedDepartments(departmentsWithKPI);
          // Update selected employee department if current selection has no KPI data (except 'Semua Departemen')
          if (selectedEmployeeDepartment !== 'Semua Departemen' && !departmentsWithKPI.includes(selectedEmployeeDepartment)) {
            setSelectedEmployeeDepartment(departmentsWithKPI[0]);
          }
        }
      } catch (err) {
        console.error("=== KPI LOADING ERROR ===");
        console.error("Full error details:", err);
        const errorObj = err as any;
        console.error("Error message:", errorObj?.message);
        console.error("Error stack:", errorObj?.stack);
        
        if (errorObj?.response) {
          console.error("Response status:", errorObj.response.status);
          console.error("Response statusText:", errorObj.response.statusText);
          console.error("Response data:", errorObj.response.data);
          console.error("Response headers:", errorObj.response.headers);
        }
        
        if (errorObj?.request) {
          console.error("Request made but no response:", errorObj.request);
        }
        
        console.error("========================");
        
        // No dummy data - only show error state
        console.log('API failed, no data will be displayed');
        setKpiBulanan([]);
        setDepartments([]);
        setSelectedDepartments([]);
        setSelectedEmployeeDepartment('');
      } finally {
        setLoadingKpi(false);
      }
    };

    // load employee KPI data from karyawan endpoint
    const loadKpiKaryawan = async () => {
      try {
        console.log('=== LOADING EMPLOYEE KPI DATA ===');
        console.log('Calling karyawanAPI.getKpiBulanan() for employees...');
        
        const res = await karyawanAPI.getKpiBulanan();
        console.log('Employee KPI API Response:', res);
        
        // Handle response for employee KPI
        let employeeData = null;
        if (Array.isArray(res)) {
          employeeData = res;
        } else if (res?.data && Array.isArray(res.data)) {
          employeeData = res.data;
        } else {
          employeeData = res;
        }
        
        if (!employeeData || !Array.isArray(employeeData)) {
          console.log('No valid employee KPI data found');
          setKpiKaryawan([]);
          return;
        }
        
        // Filter only records with karyawanId (individual employees)
        const employeeKpiRecords = employeeData.filter((item: any) => 
          item.karyawanId && item.namaKaryawan
        );
        
        console.log('Employee KPI records found:', employeeKpiRecords.length);
        console.log('Sample employee KPI data:', employeeKpiRecords.slice(0, 3));
        setKpiKaryawan(employeeKpiRecords);
        
      } catch (err) {
        console.error('Failed to load employee KPI data:', err);
        setKpiKaryawan([]);
      }
    };

    loadDepartments();
    loadKaryawan();
    loadKpi();
    loadKpiKaryawan();
  }, [fetchUser]);

  // Fetch attendance data when filters change
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!user) return;

      setLoadingAttendance(true);
      setErrorAttendance(null);

      try {
        const params = {
          month: selectedAttendanceMonth + 1, // backend expects 1-based month
          year: selectedAttendanceYear,
        };

        const response = await kehadiranAPI.getAll(params);
        setAttendanceRecords(response.data || []);
      } catch (err: any) {
        console.error('Failed to load attendance data:', err);
        setErrorAttendance(err.response?.data?.message || err.message || 'Failed to load attendance data');
        setAttendanceRecords([]);
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadAttendanceData();
  }, [selectedAttendanceMonth, selectedAttendanceYear, user]);

  // Trigger needle animation after data loads with 1-second delay
  useEffect(() => {
    if ((!loadingKpi && kpiBulanan.length > 0) || (!loadingAttendance && attendanceRecords.length > 0)) {
      // Reset first, then start animation with 1-second delay + staggered timing
      setNeedleAnimation({ annual: false, monthly: false });
      
      setTimeout(() => {
        setNeedleAnimation(prev => ({ ...prev, annual: true }));
      }, 2800); // 1 second + 500ms
      
      setTimeout(() => {
        setNeedleAnimation(prev => ({ ...prev, monthly: true }));
      }, 2800); // 1 second + 800ms
    } else {
      // Reset animation when loading or no data
      setNeedleAnimation({ annual: false, monthly: false });
    }
  }, [loadingKpi, kpiBulanan, loadingAttendance, attendanceRecords]);

  // Helper utils
  const getMonthName = (monthIndex: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthIndex];
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const getMonthOptions = () => {
    return [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' }
    ];
  };

  // Multi-selection handlers
  const handleDepartmentToggle = (department: string) => {
    setSelectedDepartments(prev => {
      if (prev.includes(department)) {
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== department);
      } else {
        return [...prev, department];
      }
    });
  };

  const handleSelectAllDepartments = () => {
    setSelectedDepartments(departments);
  };

  const handleClearAllDepartments = () => {
    setSelectedDepartments(departments.length ? [departments[0]] : []);
  };

  // ---------- KPI data transformation ----------
  // Convert backend kpiBulanan (array of {departemenId, departemen, bulan, kpiFinal, scorePresensi, scorePelatihan, bobotPresensi, bobotPelatihan, totalBobotIndikatorLain, totalScoreIndikatorLain}) into chart-friendly series
  const getLast12MonthsData = useMemo(() => {
    // Group kpiBulanan data by month (YYYY-MM)
    const grouped: Record<string, any> = {};

    if (!kpiBulanan || kpiBulanan.length === 0) {
      console.log('No KPI bulanan data available for chart');
      return [];
    }

    kpiBulanan.forEach((item: any) => {
      // Extract parameters from department-level response structure
      const bulanParam = item.bulan; // X-axis: "11" format
      const tahunParam = item.tahun || 2025; // Year: 2025
      const departemenName = item.departemen; // Department name: "HR"
      const departemenId = item.departemenId; // Department ID: "cbe52d63-6932-4da3-9e90-35bfb3a29d04"
      const kpiValue = Number(item.kpiFinalDepartemen) || 0; // Y-axis: KPI value from kpiFinalDepartemen: 62.838691357711426
      
      if (!bulanParam || !departemenName) return;
      
      // Format month for display (11 -> Nov 2025)
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const displayMonth = `${monthNames[parseInt(bulanParam, 10) - 1]} ${tahunParam}`;
      const chartKey = `${tahunParam}-${bulanParam.toString().padStart(2, '0')}`; // "2025-11"
      
      if (!grouped[chartKey]) {
        grouped[chartKey] = { 
          month: displayMonth, // Display format for chart
          bulan: chartKey,   // Original parameter for sorting
          rawMonth: chartKey // Keep original for filtering
        };
      }
      
      // Map department KPI values for line chart using kpiFinalDepartemen
      grouped[chartKey][departemenName] = kpiValue;
      console.log(`Chart Data - Bulan: ${bulanParam}, Tahun: ${tahunParam}, Display: ${displayMonth}, Dept: ${departemenName} (ID: ${departemenId}), KPI Final Departemen: ${kpiValue}`);
    });

      // Sort by month variable and keep as parameter
    const sorted = Object.values(grouped)
      .sort((a: any, b: any) => (a.bulan > b.bulan ? 1 : -1))
      .map((item: any) => ({
        ...item,
        // Use display format for chart X-axis
        month: item.month || item.displayMonth || item.bulan
      }));    console.log('=== CHART DATA PROCESSING ===');
    console.log('Grouped data:', grouped);
    console.log('Sorted chart data:', sorted);
    console.log('Chart data length:', sorted.length);
    console.log('=============================');

    return sorted;
  }, [kpiBulanan]);

  // Chart date range controls
  const [chartStartMonth, setChartStartMonth] = useState<number>(9);
  const [chartStartYear, setChartStartYear] = useState<number>(2025);
  const [chartEndMonth, setChartEndMonth] = useState<number>(10);
  const [chartEndYear, setChartEndYear] = useState<number>(2025);

  const getFilteredData = () => {
    if (!getLast12MonthsData || getLast12MonthsData.length === 0) {
      console.log('No chart data available for filtering');
      return [];
    }

    const startDate = new Date(chartStartYear, chartStartMonth);
    const endDate = new Date(chartEndYear, chartEndMonth);

    const filtered = getLast12MonthsData.filter((item: any) => {
      // Use rawMonth (2025-11) for proper filtering
      const monthStr = item.rawMonth || item.bulan; // Use format "2025-11"
      if (!monthStr) return false;
      
      const [year, month] = monthStr.split('-');
      const itemDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
      const inRange = itemDate >= startDate && itemDate <= endDate;
      
      console.log(`Filtering: ${monthStr} -> ${itemDate.toISOString().slice(0, 7)} in range ${startDate.toISOString().slice(0, 7)} to ${endDate.toISOString().slice(0, 7)}: ${inRange}`);
      return inRange;
    });

    console.log('Filtered chart data:', filtered);
    return filtered;
  };

  const getDepartmentsToRender = () => selectedDepartments;

  // Department KPI cards - compare bulan ini vs bulan lalu using current date
  const getDeptKpi = (dept: string) => {
    // Filter by departemen name to get departemen data from KPI-bulanan
    const deptData = (kpiBulanan || []).filter((x: any) => x.departemen === dept);
    
    // If no data found, return null to indicate no data available
    if (deptData.length === 0) {
      console.log(`No KPI data found for department: ${dept}`);
      return null;
    }

    // Use current date for month calculation
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1; // 1-12 (December = 12)
    const currentYearNum = now.getFullYear();
    
    // Calculate previous month
    const prevMonthDate = new Date(currentYearNum, currentMonthNum - 2, 1); // -2 because month is 0-indexed
    const previousMonthNum = prevMonthDate.getMonth() + 1;
    const previousYearNum = prevMonthDate.getFullYear();
    
    // Format as string for comparison (bulan uses string format "11", "12", etc.)
    const currentMonth = currentMonthNum.toString();
    const previousMonth = previousMonthNum.toString();
    
    console.log('Current Date KPI Calculation:', {
      now: now.toISOString(),
      currentMonth: currentMonth,
      currentYear: currentYearNum,
      previousMonth: previousMonth,
      previousYear: previousYearNum
    });
    
    // Get specific month data using the new response format
    const currentMonthData = deptData.find((x: any) => 
      x.bulan === currentMonth && (x.tahun || 2025) === currentYearNum
    );
    const previousMonthData = deptData.find((x: any) => 
      x.bulan === previousMonth && (x.tahun || 2025) === previousYearNum
    );
    
    // Fallback: if no current month data, use latest available
    let finalCurrentData = currentMonthData;
    let finalPreviousData = previousMonthData;
    let usedCurrentMonth = currentMonth;
    let usedPreviousMonth = previousMonth;
    let usedCurrentYear = currentYearNum;
    let usedPreviousYear = previousYearNum;
    
    if (!currentMonthData) {
      console.log(`No data for current month ${currentMonth}-${currentYearNum}, finding latest...`);
      // Sort by year-month descending
      const sortedData = [...deptData].sort((a: any, b: any) => {
        const aKey = `${a.tahun || 2025}-${a.bulan.toString().padStart(2, '0')}`;
        const bKey = `${b.tahun || 2025}-${b.bulan.toString().padStart(2, '0')}`;
        return bKey.localeCompare(aKey);
      });
      
      if (sortedData.length > 0) {
        finalCurrentData = sortedData[0];
        usedCurrentMonth = finalCurrentData.bulan;
        usedCurrentYear = finalCurrentData.tahun || 2025;
        console.log(`Using latest available: ${usedCurrentYear}-${usedCurrentMonth}`);
        
        // Find previous month relative to latest
        if (sortedData.length > 1) {
          finalPreviousData = sortedData[1];
          usedPreviousMonth = finalPreviousData.bulan;
          usedPreviousYear = finalPreviousData.tahun || 2025;
        }
      }
    }
    
    console.log(`Dept KPI Analysis - ${dept}:`, {
      targetCurrentMonth: usedCurrentMonth,
      targetPreviousMonth: usedPreviousMonth,
      foundCurrentData: finalCurrentData,
      foundPreviousData: finalPreviousData,
      availableMonths: deptData.map(x => `${x.tahun}-${x.bulan}`).sort(),
      currentKpiFinalDepartemen: finalCurrentData?.kpiFinalDepartemen,
      previousKpiFinalDepartemen: finalPreviousData?.kpiFinalDepartemen,
      currentDepartemenId: finalCurrentData?.departemenId,
      previousDepartemenId: finalPreviousData?.departemenId
    });
    
    // Extract KPI Final Departemen using the new response format
    const currentKPI = finalCurrentData && finalCurrentData.kpiFinalDepartemen !== undefined 
      ? Number(finalCurrentData.kpiFinalDepartemen) : null;
    const previousKPI = finalPreviousData && finalPreviousData.kpiFinalDepartemen !== undefined 
      ? Number(finalPreviousData.kpiFinalDepartemen) : null;
    const departemenId = finalCurrentData?.departemenId || finalPreviousData?.departemenId;
    const currentAvgScorePresensi = finalCurrentData ? Number(finalCurrentData.avgScorePresensi) || 0 : 0;
    const currentAvgScorePelatihan = finalCurrentData ? Number(finalCurrentData.avgScorePelatihan) || 0 : 0;
    const avgIndicatorScore = finalCurrentData ? Number(finalCurrentData.avgIndicatorScore) || 0 : 0;
    const avgIndicatorBobot = finalCurrentData ? Number(finalCurrentData.avgIndicatorBobot) || 0 : 0;
    
    console.log(`Final KPI Values for ${dept}:`, {
      departemenId,
      bulanIni: usedCurrentMonth,
      bulanLalu: usedPreviousMonth,
      kpiFinalDepartemenIni: currentKPI,
      kpiFinalDepartemenLalu: previousKPI,
      selisih: currentKPI !== null && previousKPI !== null ? currentKPI - previousKPI : null,
      dataSource: 'kpiFinalDepartemen field from new API response format'
    });
    
    // Format month names for display
    const formatMonth = (monthStr: string, year: number) => {
      if (!monthStr) return '';
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNum = parseInt(monthStr, 10);
      return `${monthNames[monthNum - 1]} ${year}`;
    };
    
    return { 
      latest: currentKPI,
      prev: previousKPI,
      currentMonth: formatMonth(usedCurrentMonth, usedCurrentYear),
      previousMonth: formatMonth(usedPreviousMonth, usedPreviousYear),
      departemenId,
      avgScorePresensi: currentAvgScorePresensi,
      avgScorePelatihan: currentAvgScorePelatihan,
      avgIndicatorScore,
      avgIndicatorBobot,
      hasCurrentData: finalCurrentData !== undefined,
      hasPreviousData: finalPreviousData !== undefined
    };
  };

  // Cards and KPI stats - 12 month average calculation
  const calculateAverageKPI = () => {
    if (!kpiBulanan || kpiBulanan.length === 0) {
      console.log('No KPI bulanan data available for 12-month average calculation');
      return 0;
    }
    
    console.log('=== 12-MONTH KPI CALCULATION START ===');
    console.log('Total KPI records available:', kpiBulanan.length);
    console.log('Sample data:', kpiBulanan.slice(0, 3));
    
    // Group by exact year-month (YYYY-MM) to maintain chronological order
    const monthlyData: Record<string, number[]> = {};
    
    kpiBulanan.forEach((item: any) => {
      const bulanParam = item.bulan; // Format: "11", "10", etc.
      const tahunParam = item.tahun || 2025; // Year: 2025
      const kpiValue = Number(item.kpiFinalDepartemen) || 0;
      
      if (!bulanParam) return;
      
      // Create year-month key (e.g., "2025-11", "2025-10")
      const yearMonthKey = `${tahunParam}-${bulanParam.toString().padStart(2, '0')}`;
      
      // Group by exact year-month
      if (!monthlyData[yearMonthKey]) {
        monthlyData[yearMonthKey] = [];
      }
      
      monthlyData[yearMonthKey].push(kpiValue);
      console.log(`Adding KPI: ${yearMonthKey}, Department: ${item.departemen}, KPI Final Departemen: ${kpiValue}`);
    });
    
        console.log('Monthly KPI data grouped by year-month:', monthlyData);
        
        // Calculate monthly averages for each specific month-year
        const monthlyAverages: Record<string, number> = {};
        Object.keys(monthlyData).forEach(yearMonth => {
          const monthKPIs = monthlyData[yearMonth];
          if (monthKPIs.length > 0) {
            const monthTotal = monthKPIs.reduce((sum, kpi) => sum + kpi, 0);
            const monthAverage = monthTotal / monthKPIs.length;
            monthlyAverages[yearMonth] = monthAverage;
            console.log(`${yearMonth}: ${monthKPIs.length} records, Total: ${monthTotal.toFixed(2)}, Average: ${monthAverage.toFixed(2)}%`);
          }
        });    // Sort months chronologically and get available data
    const availableMonths = Object.keys(monthlyAverages).sort((a, b) => a.localeCompare(b));
    console.log('Available months chronologically:', availableMonths);
    
    // Take last 12 months or all available if less than 12
    const last12Months = availableMonths.slice(-12);
    console.log(`Using last ${last12Months.length} months for 12-month average:`, last12Months);
    
    if (last12Months.length === 0) {
      console.log('No valid monthly data found');
      return 0;
    }
    
    // Calculate overall average from available months
    const monthlyValues = last12Months.map(month => monthlyAverages[month]);
    const overallTotal = monthlyValues.reduce((sum, avg) => sum + avg, 0);
    const overallAverage = overallTotal / monthlyValues.length;
    
    console.log('=== 12-MONTH KPI CALCULATION SUMMARY ===');
    console.log('Months used in calculation:');
    last12Months.forEach((month, index) => {
      const deptCount = monthlyData[month]?.length || 0;
      console.log(`  ${index + 1}. ${month}: ${monthlyAverages[month].toFixed(2)}% (${deptCount} departments)`);
    });
    console.log('Total months included:', last12Months.length);
    console.log('Sum of monthly averages:', overallTotal.toFixed(2));
    console.log('Final average calculation:', `${overallTotal.toFixed(2)} ÷ ${monthlyValues.length} = ${overallAverage.toFixed(2)}%`);
    console.log('Final result with 2 decimals:', overallAverage.toFixed(2));
    console.log('==========================================');
    
    return overallAverage;
  };

  const getCurrentMonthKPI = () => {
    if (!kpiBulanan || kpiBulanan.length === 0) return 0;
    
    console.log('Current Month KPI - Finding latest month in 2025...');
    
    // Filter data untuk tahun 2025 saja
    const data2025 = kpiBulanan.filter((item: any) => (item.tahun || 2025) === 2025);
    
    if (data2025.length === 0) {
      console.log('No data available for year 2025');
      return 0;
    }
    
    // Get all available months in 2025 and sort them
    const allMonths2025 = [...new Set(data2025.map((item: any) => 
      item.bulan.toString().padStart(2, '0')
    ))].sort();
    
    const latestMonth2025 = allMonths2025[allMonths2025.length - 1];
    
    console.log('Available months in 2025:', allMonths2025);
    console.log('Using latest month in 2025:', latestMonth2025);
    
    // Filter data untuk bulan terakhir di tahun 2025
    const latestMonthData = data2025.filter((item: any) => 
      item.bulan.toString().padStart(2, '0') === latestMonth2025
    );
    
    if (latestMonthData.length === 0) {
      console.log('No data available for latest month');
      return 0;
    }
    
    const monthlyKPI = latestMonthData.reduce((sum: number, item: any) => {
      const kpiValue = Number(item.kpiFinalDepartemen) || 0;
      return sum + kpiValue;
    }, 0) / latestMonthData.length;
    
    console.log('Latest Month KPI Result:', { 
      year: 2025,
      month: latestMonth2025,
      recordsUsed: latestMonthData.length, 
      average: monthlyKPI 
    });
    return monthlyKPI;
  };

  // Calculate average attendance score for current month
  const getCurrentMonthAttendanceScore = () => {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0;
    
    // Use current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    
    console.log('Current Month Attendance - Using date:', {
      date: now.toISOString(),
      month: currentMonth,
      year: currentYear
    });
    
    // Filter attendance records for current month/year
    const currentMonthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.tanggal);
      return recordDate.getMonth() + 1 === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    if (currentMonthRecords.length === 0) {
      console.log('No attendance records for current month');
      return 0;
    }
    
    // Calculate attendance score (Present/Total * 100)
    const totalRecords = currentMonthRecords.length;
    const presentRecords = currentMonthRecords.filter(record => 
      record.status === 'HADIR' || record.status === 'TERLAMBAT'
    ).length;
    
    const score = Math.round((presentRecords / totalRecords) * 100);
    console.log('Attendance Score:', {
      total: totalRecords,
      present: presentRecords,
      score
    });
    
    return score;
  };



  // Helper function to get employees with actual individual KPI data
  const getEmployeesWithKPIBulanan = (departmentName: string) => {
    console.log('=== getEmployeesWithKPIBulanan CALLED ===');
    console.log('Department name:', departmentName);
    console.log('Available kpiKaryawan data:', kpiKaryawan);
    console.log('Available karyawan data:', karyawan);
    console.log('==========================================');
    
    // Filter employee KPI data by department
    let filteredKPIData = kpiKaryawan;
    
    if (departmentName !== 'Semua Departemen') {
      filteredKPIData = kpiKaryawan.filter((item: any) => 
        item.departemen === departmentName
      );
    }
    
    console.log(`Filtered KPI data for ${departmentName}:`, filteredKPIData.length);
    
    // Use current date for filtering
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1; // 1-12
    const currentYearNum = now.getFullYear();
    const currentMonthStr = currentMonthNum.toString();
    
    let currentMonthData = filteredKPIData.filter((item: any) => 
      item.bulan === currentMonthStr && (item.tahun || 2025) === currentYearNum
    );
    
    // Fallback: if no current month data, use latest available
    if (currentMonthData.length === 0) {
      console.log(`No employee data for current month ${currentMonthStr}-${currentYearNum}, using latest...`);
      const sortedData = [...filteredKPIData].sort((a: any, b: any) => {
        const aKey = `${a.tahun || 2025}-${a.bulan.toString().padStart(2, '0')}`;
        const bKey = `${b.tahun || 2025}-${b.bulan.toString().padStart(2, '0')}`;
        return bKey > aKey ? 1 : -1;
      });
      const latestItem = sortedData[0];
      if (latestItem) {
        const latestMonth = latestItem.bulan;
        const latestYear = latestItem.tahun || 2025;
        currentMonthData = filteredKPIData.filter((item: any) => 
          item.bulan === latestMonth && (item.tahun || 2025) === latestYear
        );
        console.log(`Using latest month ${latestYear}-${latestMonth} for employee KPI`);
      }
    }
    
    console.log(`Employee KPI data for processing:`, currentMonthData);
    
    // Transform KPI data using the response format
    const employeesWithKPI = currentMonthData.map((kpiData: any) => {
      // Find matching employee data for additional info
      const employeeData = karyawan.find(k => k.id === kpiData.karyawanId);
      
      const rating = kpiData.kpiFinal >= 90 ? 'Excellent' : 
                    kpiData.kpiFinal >= 75 ? 'Good' : 
                    kpiData.kpiFinal >= 60 ? 'Average' : 'Poor';
      
      return {
        id: kpiData.karyawanId, // "b97f9863-e867-4807-bc51-d48e4f82ceaa"
        nama: kpiData.namaKaryawan, // "Jane Smith"
        scoreKehadiran: Number(kpiData.scorePresensi) || 0, // 98
        scorePelatihan: Number(kpiData.scorePelatihan) || 0, // 94
        kpiFinal: Number(kpiData.kpiFinal) || 0, // 61.68861392832988
        performance: Number(kpiData.kpiFinal) || 0,
        productivity: Number(kpiData.scorePelatihan) || 0,
        attendance: Number(kpiData.scorePresensi) || 0,
        rating,
        departemenId: kpiData.departemenId, // "0f08c413-c4ee-46a3-990d-67a78f868729"
        departemenNama: kpiData.departemen, // "Sales & Marketing"
        bobotPresensi: Number(kpiData.bobotPresensi) || 0, // 60
        bobotPelatihan: Number(kpiData.bobotPelatihan) || 0, // 40
        totalBobotIndikatorLain: Number(kpiData.totalBobotIndikatorLain) || 0, // 44
        totalScoreIndikatorLain: Number(kpiData.totalScoreIndikatorLain) || 0, // 2679.5876267748445
        bulan: kpiData.bulan, // "2025-11"
        jabatan: employeeData?.jabatan || [{ nama: 'Employee' }],
        position: employeeData?.jabatan?.[0]?.nama || 'Employee'
      };
    });
    
    console.log(`Final employees with KPI for ${departmentName}:`, employeesWithKPI.length, employeesWithKPI);
    return employeesWithKPI.sort((a: any, b: any) => (b.kpiFinal || 0) - (a.kpiFinal || 0));
  };

  // ---------- Attendance helpers (kehadiran) ----------
  const getAttendanceData = () => {
    const year = selectedAttendanceYear;
    const month = selectedAttendanceMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const filteredRecords = attendanceRecords.filter(record => {
      const karyawanDept = record.karyawan?.departemen?.[0]?.nama;
      return karyawanDept === selectedAttendanceDepartment;
    });

    const karyawanMap = new Map<string, {
      id: string;
      name: string;
      position: string;
      records: Map<number, Kehadiran>;
    }>();

    filteredRecords.forEach(record => {
      const karyawanId = record.karyawanId;
      const recordDate = new Date(record.tanggal);
      const day = recordDate.getDate();

      if (!karyawanMap.has(karyawanId)) {
        karyawanMap.set(karyawanId, {
          id: karyawanId,
          name: record.karyawan?.nama || 'Unknown',
          position: record.karyawan?.jabatan?.[0]?.nama || '-',
          records: new Map(),
        });
      }

      karyawanMap.get(karyawanId)!.records.set(day, record);
    });

    const attendanceData = Array.from(karyawanMap.values()).map(employeeData => {
      const dailyAttendance: { [key: string]: string } = {};
      let presentDays = 0;
      let lateDays = 0;
      let absentDays = 0;
      let workingDaysCount = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        if (isWeekend) {
          dailyAttendance[`day${day}`] = '-';
        } else {
          workingDaysCount++;
          const record = employeeData.records.get(day);

          if (!record) {
            dailyAttendance[`day${day}`] = 'X';
            absentDays++;
          } else {
            const status = record.status;
            if (status === 'HADIR') {
              dailyAttendance[`day${day}`] = '✓';
              presentDays++;
            } else if (status === 'TERLAMBAT') {
              dailyAttendance[`day${day}`] = 'L';
              lateDays++;
            } else if (status === 'IZIN' || status === 'SAKIT') {
              dailyAttendance[`day${day}`] = 'I';
              presentDays++;
            } else if (status === 'ALPA' || status === 'BELUM_ABSEN') {
              dailyAttendance[`day${day}`] = 'X';
              absentDays++;
            } else {
              dailyAttendance[`day${day}`] = 'X';
              absentDays++;
            }
          }
        }
      }

      const totalAttended = presentDays + lateDays;
      const attendanceRate = workingDaysCount > 0 ? Math.round((totalAttended / workingDaysCount) * 100) : 0;

      return {
        id: employeeData.id,
        name: employeeData.name,
        position: employeeData.position,
        ...dailyAttendance,
        presentDays,
        lateDays,
        absentDays,
        attendanceRate,
        totalWorkingDays: workingDaysCount
      };
    });

    return attendanceData;
  };

  const getSelectedMonthDays = () => {
    const year = selectedAttendanceYear;
    const month = selectedAttendanceMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      days.push({
        day,
        dayName,
        isWeekend
      });
    }

    return days;
  };

  const getAttendanceSummary = () => {
    const attendanceData = getAttendanceData();

    if (attendanceData.length === 0) return {
      averageAttendance: 0,
      totalPresent: 0,
      totalLate: 0,
      totalAbsent: 0,
      workingDays: 0
    };

    const totalPresent = attendanceData.reduce((sum, emp) => sum + emp.presentDays, 0);
    const totalLate = attendanceData.reduce((sum, emp) => sum + emp.lateDays, 0);
    const totalAbsent = attendanceData.reduce((sum, emp) => sum + emp.absentDays, 0);
    const workingDays = attendanceData[0]?.totalWorkingDays || 0;
    const totalPossible = attendanceData.length * workingDays;
    const averageAttendance = totalPossible > 0 ? Math.round(((totalPresent + totalLate) / totalPossible) * 100) : 0;

    return {
      averageAttendance,
      totalPresent,
      totalLate,
      totalAbsent,
      workingDays
    };
  };

  const days = getSelectedMonthDays();
  const attendanceData = getAttendanceData();
  const attendanceSummary = getAttendanceSummary();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                loadingKpi ? 'bg-yellow-500' : 
                kpiBulanan.length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-muted-foreground">
                {loadingKpi ? 'Loading...' : 
                 kpiBulanan.length > 0 ? `API Connected (${kpiBulanan.length} records)` : 'No API Data'}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-3">
              <Card>
                <CardContent className="p-2">
                  {loadingKpi ? (
                    <div className="flex flex-col items-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mb-1"></div>
                      <p className="text-xs text-muted-foreground">Loading...</p>
                    </div>
                  ) : kpiBulanan.length === 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-52 h-32 mb-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { value: 25, color: '#dc2626' },
                                { value: 25, color: '#ea580c' }, 
                                { value: 25, color: '#eab308' },
                                { value: 25, color: '#16a34a' }
                              ]}
                              cx="50%"
                              cy="90%"
                              innerRadius={55}
                              outerRadius={80}
                              startAngle={180}
                              endAngle={0}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill="#dc2626" />
                              <Cell fill="#ea580c" />
                              <Cell fill="#eab308" />
                              <Cell fill="#16a34a" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
                          <div className="text-lg font-bold text-gray-400">0%</div>
                        </div>
                        {/* Needle for 0% */}
                        <div 
                          className="absolute w-0.5 h-18 bg-gray-600 dark:bg-gray-300 origin-bottom z-10"
                          style={{
                            bottom: '10%',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(-90deg)',
                            transformOrigin: 'bottom center'
                          }}
                        />

                      </div>
                      <div className="text-center mt-8">
                        <h3 className="text-sm font-semibold text-foreground">KPI Tahunan {new Date().getFullYear()}</h3>
                        <p className="text-xs text-muted-foreground">No data</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative w-52 h-32 mb-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { value: 25, color: '#dc2626' },
                                { value: 25, color: '#ea580c' }, 
                                { value: 25, color: '#eab308' },
                                { value: 25, color: '#16a34a' }
                              ]}
                              cx="50%"
                              cy="90%"
                              innerRadius={55}
                              outerRadius={80}
                              startAngle={180}
                              endAngle={0}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill="#dc2626" />
                              <Cell fill="#ea580c" />
                              <Cell fill="#eab308" />
                              <Cell fill="#16a34a" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
                          <div className={`text-lg font-bold ${
                            calculateAverageKPI() <= 25 ? 'text-red-600 dark:text-red-400' :
                            calculateAverageKPI() <= 50 ? 'text-orange-600 dark:text-orange-400' :
                            calculateAverageKPI() <= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {calculateAverageKPI().toFixed(1)}%
                          </div>
                        </div>
                        {/* Needle based on KPI value */}
                        <div 
                          className="absolute w-0.5 h-18 bg-gray-800 dark:bg-white origin-bottom z-10"
                          style={{
                            bottom: '10%',
                            left: '50%',
                            transform: `translateX(-50%) rotate(${needleAnimation.annual ? (-90 + (calculateAverageKPI() / 100 * 180)) : -90}deg)`,
                            transformOrigin: 'bottom center',
                            transition: needleAnimation.annual ? 'transform 3.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
                          }}
                        />
                      </div>
                      <div className="text-center mt-8">
                        <h3 className="text-sm font-semibold text-foreground">KPI Tahunan {new Date().getFullYear()}</h3>
                        <p className="text-xs text-muted-foreground">{kpiBulanan.length} data</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  {loadingKpi ? (
                    <div className="flex flex-col items-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mb-1"></div>
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  </div>
                ) : kpiBulanan.length === 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-52 h-32 mb-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { value: 25, color: '#dc2626' },
                              { value: 25, color: '#ea580c' }, 
                              { value: 25, color: '#eab308' },
                              { value: 25, color: '#16a34a' }
                            ]}
                            cx="50%"
                            cy="90%"
                            innerRadius={55}
                            outerRadius={80}
                            startAngle={180}
                            endAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#dc2626" />
                            <Cell fill="#ea580c" />
                            <Cell fill="#eab308" />
                            <Cell fill="#16a34a" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
                        <div className="text-lg font-bold text-gray-400">0%</div>
                      </div>
                      {/* Needle for 0% */}
                      <div 
                        className="absolute w-0.5 h-18 bg-gray-600 dark:bg-gray-300 origin-bottom z-10"
                        style={{
                          bottom: '10%',
                          left: '50%',
                          transform: 'translateX(-50%) rotate(-90deg)',
                          transformOrigin: 'bottom center'
                        }}
                      />
                    </div>
                    <div className="text-center mt-8">
                      <h3 className="text-sm font-semibold text-foreground">KPI {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-xs text-muted-foreground">No data</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-52 h-32 mb-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { value: 25, color: '#dc2626' },
                              { value: 25, color: '#ea580c' }, 
                              { value: 25, color: '#eab308' },
                              { value: 25, color: '#16a34a' }
                            ]}
                            cx="50%"
                            cy="90%"
                            innerRadius={55}
                            outerRadius={80}
                            startAngle={180}
                            endAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#dc2626" />
                            <Cell fill="#ea580c" />
                            <Cell fill="#eab308" />
                            <Cell fill="#16a34a" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
                        <div className={`text-lg font-bold ${
                          getCurrentMonthKPI() <= 25 ? 'text-red-600 dark:text-red-400' :
                          getCurrentMonthKPI() <= 50 ? 'text-orange-600 dark:text-orange-400' :
                          getCurrentMonthKPI() <= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {getCurrentMonthKPI().toFixed(1)}%
                        </div>
                      </div>
                      {/* Needle based on KPI value */}
                      <div 
                        className="absolute w-0.5 h-18 bg-gray-800 dark:bg-white origin-bottom z-10"
                        style={{
                          bottom: '10%',
                          left: '50%',
                          transform: `translateX(-50%) rotate(${needleAnimation.monthly ? (-90 + (getCurrentMonthKPI() / 100 * 180)) : -90}deg)`,
                          transformOrigin: 'bottom center',
                          transition: needleAnimation.monthly ? 'transform 3.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
                        }}
                      />
                    </div>
                    <div className="text-center mt-8">
                      <h3 className="text-sm font-semibold text-foreground">KPI {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-xs text-muted-foreground">Rata-rata</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2">
                {loadingAttendance ? (
                  <div className="flex flex-col items-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mb-1"></div>
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-52 h-32 mb-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { value: 25, color: '#dc2626' },
                              { value: 25, color: '#ea580c' }, 
                              { value: 25, color: '#eab308' },
                              { value: 25, color: '#16a34a' }
                            ]}
                            cx="50%"
                            cy="90%"
                            innerRadius={55}
                            outerRadius={80}
                            startAngle={180}
                            endAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#dc2626" />
                            <Cell fill="#ea580c" />
                            <Cell fill="#eab308" />
                            <Cell fill="#16a34a" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
                        <div className="text-lg font-bold text-gray-400">0%</div>
                      </div>
                      {/* Needle for 0% */}
                      <div 
                        className="absolute w-0.5 h-18 bg-gray-600 dark:bg-gray-300 origin-bottom z-10"
                        style={{
                          bottom: '10%',
                          left: '50%',
                          transform: 'translateX(-50%) rotate(-90deg)',
                          transformOrigin: 'bottom center'
                        }}
                      />
                    </div>
                    <div className="text-center mt-8">
                      <h3 className="text-sm font-semibold text-foreground">Score Presensi {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-xs text-muted-foreground">No data</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-52 h-32 mb-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { value: 25, color: '#dc2626' },
                              { value: 25, color: '#ea580c' }, 
                              { value: 25, color: '#eab308' },
                              { value: 25, color: '#16a34a' }
                            ]}
                            cx="50%"
                            cy="90%"
                            innerRadius={55}
                            outerRadius={80}
                            startAngle={180}
                            endAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#dc2626" />
                            <Cell fill="#ea580c" />
                            <Cell fill="#eab308" />
                            <Cell fill="#16a34a" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
                        <div className={`text-lg font-bold ${
                          getCurrentMonthAttendanceScore() <= 25 ? 'text-red-600 dark:text-red-400' :
                          getCurrentMonthAttendanceScore() <= 50 ? 'text-orange-600 dark:text-orange-400' :
                          getCurrentMonthAttendanceScore() <= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {getCurrentMonthAttendanceScore()}%
                        </div>
                      </div>
                      {/* Needle based on attendance score */}
                      <div 
                        className="absolute w-0.5 h-18 bg-gray-800 dark:bg-white origin-bottom z-10"
                        style={{
                          bottom: '10%',
                          left: '50%',
                          transform: `translateX(-50%) rotate(${needleAnimation.monthly ? (-90 + (getCurrentMonthAttendanceScore() / 100 * 180)) : -90}deg)`,
                          transformOrigin: 'bottom center',
                          transition: needleAnimation.monthly ? 'transform 3.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
                        }}
                      />
                    </div>
                    <div className="text-center mt-8">
                      <h3 className="text-sm font-semibold text-foreground">Score Presensi {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-xs text-muted-foreground">Rata-rata kehadiran</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Department Performance Summary - KPI Final by Current & Previous Month */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {departments.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No departments available. Please check your connection to the backend API.</p>
              </div>
            ) : kpiBulanan.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No KPI data available. Please check your connection to the backend API.</p>
              </div>
            ) : (
              departments.map((dept) => {
                console.log(`Processing department card for: ${dept}`);
                const deptKpiData = getDeptKpi(dept);
                
                // If no KPI data for this department, don't show the card
                if (!deptKpiData) {
                  return null;
                }

                const { latest, prev, currentMonth, previousMonth, departemenId } = deptKpiData;
                // Handle null values from KPI-bulanan response - kpiFinalDepartemen
                const latestNum = latest !== null ? Number(latest) : null;  // kpiFinalDepartemen November 2025
                const prevNum = prev !== null ? Number(prev) : null;        // kpiFinalDepartemen Oktober 2025
                
                console.log(`Rendering ${dept} card:`, {
                  latestKpiFinalDepartemen: latestNum,
                  prevKpiFinalDepartemen: prevNum,
                  currentMonth,
                  previousMonth
                });
                
                // Calculate trend only if both values exist
                let trend: 'up' | 'down' | 'stable' = 'stable';
                let trendValue = 0;
                if (latestNum !== null && prevNum !== null) {
                  trend = latestNum > prevNum ? 'up' : latestNum < prevNum ? 'down' : 'stable';
                  trendValue = latestNum - prevNum;
                }
                const stats = { count: (karyawan || []).filter(k => k.departemen?.some((d: any) => d.nama === dept)).length || 0, avgPerformance: 0 };

                return (
                  <Card key={`dept-${dept}`} className="hover:shadow-lg transition-shadow duration-200" data-department-id={departemenId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                            {(() => {
                              const IconComponent = getDepartmentIcon(dept);
                              return <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
                            })()}
                          </div>
                          <span className="text-sm font-semibold">{dept}</span>
                        </div>
                        <TrendIcon trend={trend} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">
                          {latestNum !== null ? `${latestNum.toFixed(2)}%` : '-'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          KPI Final Departemen - {currentMonth || 'Nov 2025'}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Bulan Lalu:</span>
                        <span className="font-medium">
                          {prevNum !== null ? `${prevNum.toFixed(2)}%` : '-'} ({previousMonth || 'Oct 2025'})
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Selisih:</span>
                        <span className={`font-medium ${
                          latestNum !== null && prevNum !== null 
                            ? (trendValue >= 0 ? 'text-green-600' : 'text-red-600')
                            : 'text-gray-500'
                        }`}>
                          {latestNum !== null && prevNum !== null 
                            ? `${trendValue >= 0 ? '+' : ''}${trendValue.toFixed(2)}%`
                            : '-'
                          }
                        </span>
                      </div>
                      <div className="pt-2 border-t space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{stats.count}</span> employees
                        </p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 h-8 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => {
                            setSelectedDepartmentForDetail(dept);
                            setShowKpiDetailPopup(true);
                          }}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          View Employee KPI Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }).filter(Boolean) // Remove null entries
            )}
          </div>

          {/* Department KPI Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Department KPI Performance</CardTitle>
                  <CardDescription>Monthly KPI trends for selected departments ({selectedDepartments.length} selected)</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2">
                    <Select value={chartStartMonth.toString()} onValueChange={(value) => setChartStartMonth(parseInt(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Start Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {getMonthOptions().map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={chartStartYear.toString()} onValueChange={(value) => setChartStartYear(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {getYearOptions().map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center px-2 text-muted-foreground">to</span>
                    <Select value={chartEndMonth.toString()} onValueChange={(value) => setChartEndMonth(parseInt(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="End Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {getMonthOptions().map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={chartEndYear.toString()} onValueChange={(value) => setChartEndYear(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {getYearOptions().map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-48">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        Filter Departments ({selectedDepartments.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={handleSelectAllDepartments}>Select All</Button>
                          <Button variant="outline" size="sm" onClick={handleClearAllDepartments}>Clear All</Button>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {departments.map((dept) => (
                            <div key={dept} className="flex items-center space-x-2">
                              <Checkbox id={dept} checked={selectedDepartments.includes(dept)} onCheckedChange={() => handleDepartmentToggle(dept)} />
                              <label htmlFor={dept} className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: departmentColors[dept] }} />
                                {dept}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                {loadingKpi ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Loading chart data...</p>
                    </div>
                  </div>
                ) : getFilteredData().length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-lg font-medium text-muted-foreground mb-2">No chart data available</p>
                      <p className="text-sm text-muted-foreground">Check if KPI data is loaded from backend API</p>
                      <p className="text-xs text-muted-foreground mt-2">KPI Records: {kpiBulanan.length} | Departments: {departments.length}</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getFilteredData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: 'KPI (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value, name) => [`KPI Final: ${Math.round(Number(value)) || 0}%`, `${name} Dept`]} 
                        labelFormatter={(label) => `Bulan: ${label}`}
                        contentStyle={{
                          backgroundColor: document.documentElement.classList.contains('dark') ? 'rgb(64, 64, 64)' : 'white',
                          border: document.documentElement.classList.contains('dark') ? '1px solid rgb(75, 85, 99)' : '1px solid rgb(229, 231, 235)',
                          borderRadius: '8px',
                          color: document.documentElement.classList.contains('dark') ? 'white' : 'rgb(17, 24, 39)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        labelStyle={{
                          color: document.documentElement.classList.contains('dark') ? 'white' : 'rgb(17, 24, 39)',
                          fontWeight: '600'
                        }}
                      />
                      <Legend />
                      {getDepartmentsToRender().map((dept) => (
                        <Line key={dept} type="monotone" dataKey={dept} stroke={departmentColors[dept] || '#333'} strokeWidth={3} dot={{ fill: departmentColors[dept] || '#333', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employee Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Employee Attendance - {getMonthName(selectedAttendanceMonth)} {selectedAttendanceYear}</CardTitle>
                  <CardDescription>Daily attendance tracking for {selectedAttendanceDepartment} department</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedAttendanceDepartment} onValueChange={setSelectedAttendanceDepartment}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>{departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={selectedAttendanceMonth.toString()} onValueChange={(value) => setSelectedAttendanceMonth(parseInt(value))}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>{getMonthOptions().map((month) => <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={selectedAttendanceYear.toString()} onValueChange={(value) => setSelectedAttendanceYear(parseInt(value))}>
                    <SelectTrigger className="w-20"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>{getYearOptions().map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAttendance ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading attendance data...</p>
                  </div>
                </div>
              ) : errorAttendance ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                      <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">Failed to load attendance data</p>
                    <p className="text-sm text-muted-foreground max-w-md">{errorAttendance}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                </div>
              ) : attendanceData.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">No attendance data</p>
                    <p className="text-sm text-muted-foreground">No employees found for {selectedAttendanceDepartment} department in {getMonthName(selectedAttendanceMonth)} {selectedAttendanceYear}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto relative">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background z-20 border-r font-semibold min-w-[120px] shadow-sm">Employee</TableHead>
                          {days.map((dayInfo) => (
                            <TableHead key={dayInfo.day} className={`text-center min-w-[40px] text-xs ${dayInfo.isWeekend ? 'bg-muted/50 text-muted-foreground' : ''}`}>
                              <div className="flex flex-col">
                                <span>{dayInfo.day}</span>
                                <span className="text-xs">{dayInfo.dayName}</span>
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="sticky right-[200px] bg-background z-20 text-center font-semibold border-l shadow-sm min-w-[60px]">Present</TableHead>
                          <TableHead className="sticky right-[140px] bg-background z-20 text-center font-semibold shadow-sm min-w-[60px]">Late</TableHead>
                          <TableHead className="sticky right-[80px] bg-background z-20 text-center font-semibold shadow-sm min-w-[60px]">Absent</TableHead>
                          <TableHead className="sticky right-0 bg-background z-20 text-center font-semibold shadow-sm min-w-[80px]">Rate %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceData.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="sticky left-0 bg-background z-20 border-r font-medium shadow-sm">
                              {employee.name}
                            </TableCell>
                            {days.map((dayInfo) => {
                              const status = employee[`day${dayInfo.day}` as keyof typeof employee] as string;
                              return (
                                <TableCell key={dayInfo.day} className={`text-center text-sm ${dayInfo.isWeekend ? 'bg-muted/30' : ''}`}>
                                  <span className={`
                                    inline-block w-6 h-6 rounded text-xs leading-6 font-medium
                                    ${status === '✓' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                                      status === 'L' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                                      status === 'X' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' :
                                      'text-muted-foreground'}
                                  `}>
                                    {status}
                                  </span>
                                </TableCell>
                              );
                            })}
                            <TableCell className="sticky right-[200px] bg-background z-20 text-center font-medium border-l text-green-700 dark:text-green-400 shadow-sm">
                              {employee.presentDays}
                            </TableCell>
                            <TableCell className="sticky right-[140px] bg-background z-20 text-center font-medium text-yellow-700 dark:text-yellow-400 shadow-sm">
                              {employee.lateDays}
                            </TableCell>
                            <TableCell className="sticky right-[80px] bg-background z-20 text-center font-medium text-red-700 dark:text-red-400 shadow-sm">
                              {employee.absentDays}
                            </TableCell>
                            <TableCell className="sticky right-0 bg-background z-20 text-center font-medium shadow-sm">
                              <Badge variant="outline" className={employee.attendanceRate >= 95 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : employee.attendanceRate >= 85 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' : employee.attendanceRate >= 75 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'}>
                                {employee.attendanceRate}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-center">✓</span>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-center">L</span>
                      <span>Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 text-center">X</span>
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium text-muted-foreground text-center">-</span>
                      <span>Weekend/Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded text-xs leading-6 font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-center">I</span>
                      <span>Izin/Sakit</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary - {getMonthName(selectedAttendanceMonth)} {selectedAttendanceYear}</CardTitle>
              <CardDescription>{selectedAttendanceDepartment} Department Statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceSummary.averageAttendance}%</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Average Attendance</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceSummary.totalPresent}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total Present</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceSummary.totalLate}</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Total Late</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceSummary.totalAbsent}</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Total Absent</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{attendanceSummary.workingDays}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Working Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Employee Details Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Top 5 Performers - {selectedEmployeeDepartment === 'Semua Departemen' ? 'All Departments' : `${selectedEmployeeDepartment} Department`}</CardTitle>
                  <CardDescription>Top performing employees based on KPI bulanan (Score Kehadiran & Score Pelatihan)</CardDescription>
                </div>
                <Select value={selectedEmployeeDepartment} onValueChange={setSelectedEmployeeDepartment}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua Departemen">Semua Departemen</SelectItem>
                    {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loadingKpi || !kpiBulanan || kpiBulanan.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading KPI performance data...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      {selectedEmployeeDepartment === 'Semua Departemen' && <TableHead>Department</TableHead>}
                      <TableHead>KPI Final</TableHead>
                      <TableHead>Score Pelatihan</TableHead>
                      <TableHead>Score Kehadiran</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getEmployeesWithKPIBulanan(selectedEmployeeDepartment)
                      .slice(0, 5)
                      .map((employee: any, index: number) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-bold
                                ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                                  index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' :
                                    index === 2 ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' :
                                      'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'}
                              `}>#{index + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{employee.nama || employee.name}</TableCell>
                          <TableCell>{employee.jabatan?.[0]?.nama || employee.position}</TableCell>
                          {selectedEmployeeDepartment === 'Semua Departemen' && (
                            <TableCell>{employee.departemenNama || employee.departemen?.[0]?.nama || 'Unknown'}</TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                <div className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300" style={{ width: `${employee.kpiFinal || 0}%` }} />
                              </div>
                              <span className="text-sm min-w-[35px]">{(employee.kpiFinal || 0).toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                <div className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300" style={{ width: `${employee.scorePelatihan || 0}%` }} />
                              </div>
                              <span className="text-sm min-w-[35px]">{(employee.scorePelatihan || 0).toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                <div className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full transition-all duration-300" style={{ width: `${employee.scoreKehadiran || 0}%` }} />
                              </div>
                              <span className="text-sm min-w-[35px]">{(employee.scoreKehadiran || 0).toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={ratingColors[employee.rating || 'Average']}>
                              {employee.rating || 'Average'}
                            </Badge>
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

      {/* KPI Detail Popup */}
      <Dialog open={showKpiDetailPopup} onOpenChange={setShowKpiDetailPopup}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Employee KPI Details - {selectedDepartmentForDetail}</DialogTitle>
            <DialogDescription>
              Individual KPI Final scores for all employees in {selectedDepartmentForDetail} department
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] space-y-2">
            {selectedDepartmentForDetail && getEmployeesWithKPIBulanan(selectedDepartmentForDetail).length > 0 ? (
              getEmployeesWithKPIBulanan(selectedDepartmentForDetail).map((employee: any, idx: number) => (
                <div key={employee.id || idx} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      employee.kpiFinal >= 90 ? 'bg-green-500' :
                      employee.kpiFinal >= 75 ? 'bg-blue-500' :
                      employee.kpiFinal >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {employee.nama || employee.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.jabatan?.[0]?.nama || 'No Position'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {(employee.kpiFinal || 0).toFixed(2)}%
                    </p>
                    <Badge variant="outline" className={`text-xs ${
                      employee.kpiFinal >= 90 ? 'border-green-500 text-green-700 dark:text-green-300' :
                      employee.kpiFinal >= 75 ? 'border-blue-500 text-blue-700 dark:text-blue-300' :
                      employee.kpiFinal >= 60 ? 'border-yellow-500 text-yellow-700 dark:text-yellow-300' :
                      'border-red-500 text-red-700 dark:text-red-300'
                    }`}>
                      {employee.kpiFinal >= 90 ? 'Excellent' :
                       employee.kpiFinal >= 75 ? 'Good' :
                       employee.kpiFinal >= 60 ? 'Average' : 'Poor'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No employee data available for this department</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
