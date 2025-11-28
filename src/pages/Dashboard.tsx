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
} from 'recharts';

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

  // Selection & UI state
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('Semua Departemen');
  const [selectedAttendanceDepartment, setSelectedAttendanceDepartment] = useState('Analytics');
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(new Date().getMonth());
  const [selectedAttendanceYear, setSelectedAttendanceYear] = useState(new Date().getFullYear());

  // Data states
  const [departments, setDepartments] = useState<string[]>([]);
  const [karyawan, setKaryawan] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Kehadiran[]>([]);
  const [kpiBulanan, setKpiBulanan] = useState<any[]>([]);

  // Loading/error states
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [errorAttendance, setErrorAttendance] = useState<string | null>(null);
  const [loadingKpi, setLoadingKpi] = useState(false);

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
        
        // Test API availability first
        const res = await kpiAPI.getBulanan();
        
        console.log('=== API RESPONSE RECEIVED ===');
        console.log('Full response object:', res);
        console.log('Response status:', res?.status);
        console.log('Response headers:', res?.headers);
        console.log('Response data property:', res?.data);
        console.log('Response type:', typeof res);
        console.log('========================');
        
        // Try different response structures
        let raw = null;
        if (res?.data) {
          raw = res.data;
          console.log('Using res.data');
        } else if (Array.isArray(res)) {
          raw = res;
          console.log('Response is direct array');
        } else if (res?.result || res?.results) {
          raw = res.result || res.results;
          console.log('Using res.result/results');
        } else {
          raw = res;
          console.log('Using raw response');
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
        
        // Process KPI data with proper parameter structure
        const clean = (raw || []).map((x: any, index: number) => {
          console.log(`Processing item ${index}:`, x);
          
          const processed = {
            departemenId: x.departemenId || x.id || `dept-${index}`,
            departemen: x.departemen || x.department || x.nama || 'Unknown',
            bulan: x.bulan || x.month || x.periode || '2025-11',
            scorePresensi: Number(x.scorePresensi || x.attendance_score || x.presensi || 0),
            scorePelatihan: Number(x.scorePelatihan || x.training_score || x.pelatihan || 0),
            bobotPresensi: Number(x.bobotPresensi || x.attendance_weight || 60),
            bobotPelatihan: Number(x.bobotPelatihan || x.training_weight || 40),
            totalBobotIndikatorLain: Number(x.totalBobotIndikatorLain || 0),
            totalScoreIndikatorLain: Number(x.totalScoreIndikatorLain || 0),
            kpiFinal: Number(x.kpiFinal || x.finalKPI || x.kpi || x.score || 0)
          };
          
          console.log(`Processed item ${index}:`, processed);
          return processed;
        });
        
        console.log('=== FINAL PROCESSING RESULT ===');
        console.log('Final cleaned data length:', clean.length);
        console.log('Final cleaned data:', clean);
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

    loadDepartments();
    loadKaryawan();
    loadKpi();
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
      // Extract parameters from backend data structure
      const bulanParam = item.bulan; // X-axis: "2025-10" format
      const departemenName = item.departemen; // Department name for grouping
      const departemenId = item.departemenId; // Unique department identifier
      const kpiValue = Number(item.kpiFinal) || 0; // Y-axis: KPI performance value
      
      if (!bulanParam || !departemenName) return;
      
      // Format month for display (2025-10 -> Oct 2025)
      const [year, month] = bulanParam.split('-');
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const displayMonth = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
      
      if (!grouped[bulanParam]) {
        grouped[bulanParam] = { 
          month: displayMonth, // Display format for chart
          bulan: bulanParam,   // Original parameter for sorting
          rawMonth: bulanParam // Keep original for filtering
        };
      }
      
      // Map department KPI values for line chart
      grouped[bulanParam][departemenName] = kpiValue;
      console.log(`Chart Data - Bulan: ${bulanParam}, Display: ${displayMonth}, Dept: ${departemenName} (${departemenId}), KPI: ${kpiValue}`);
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
  const [chartStartMonth, setChartStartMonth] = useState<number>(new Date().getMonth() - 11);
  const [chartStartYear, setChartStartYear] = useState<number>(new Date().getFullYear());
  const [chartEndMonth, setChartEndMonth] = useState<number>(new Date().getMonth());
  const [chartEndYear, setChartEndYear] = useState<number>(new Date().getFullYear());

  const getFilteredData = () => {
    if (!getLast12MonthsData || getLast12MonthsData.length === 0) {
      console.log('No chart data available for filtering');
      return [];
    }

    const startDate = new Date(chartStartYear, chartStartMonth < 0 ? 0 : chartStartMonth);
    const endDate = new Date(chartEndYear, chartEndMonth);

    const filtered = getLast12MonthsData.filter((item: any) => {
      // Use rawMonth (2025-10) for proper filtering instead of display format
      const monthStr = item.rawMonth || item.bulan; // Use backend format "2025-10"
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

  // Department KPI cards - compare bulan ini vs bulan lalu using departemenId
  const getDeptKpi = (dept: string) => {
    // Filter by departemen name to get departemenId data
    const deptData = (kpiBulanan || []).filter((x: any) => x.departemen === dept);
    
    // If no data found, return null to indicate no data available
    if (deptData.length === 0) {
      console.log(`No KPI data found for department: ${dept}`);
      return null;
    }

    // Sort by bulan ascending to get proper month comparison
    const sorted = [...deptData].sort((a: any, b: any) => (a.bulan > b.bulan ? 1 : -1));
    
    // Get bulan ini (current/latest) and bulan lalu (previous)
    const currentMonthData = sorted[sorted.length - 1]; // bulan ini
    const previousMonthData = sorted[sorted.length - 2]; // bulan lalu
    
    // Extract KPI parameters from backend data structure
    const currentKPI = Number(currentMonthData?.kpiFinal) || 0;
    const previousKPI = Number(previousMonthData?.kpiFinal) || 0;
    const departemenId = currentMonthData?.departemenId;
    const currentScorePresensi = Number(currentMonthData?.scorePresensi) || 0;
    const currentScorePelatihan = Number(currentMonthData?.scorePelatihan) || 0;
    const bobotPresensi = Number(currentMonthData?.bobotPresensi) || 0;
    const bobotPelatihan = Number(currentMonthData?.bobotPelatihan) || 0;
    
    console.log(`Dept KPI Analysis - ${dept}:`, {
      departemenId,
      currentMonth: currentMonthData?.bulan,
      previousMonth: previousMonthData?.bulan,
      kpiCurrent: currentKPI,
      kpiPrevious: previousKPI,
      kpiChange: currentKPI - previousKPI,
      scorePresensi: currentScorePresensi,
      scorePelatihan: currentScorePelatihan,
      bobot: { presensi: bobotPresensi, pelatihan: bobotPelatihan }
    });
    
    // Format month names for display
    const formatMonth = (monthStr: string) => {
      if (!monthStr) return '';
      const [year, month] = monthStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    };
    
    return { 
      latest: currentKPI,
      prev: previousKPI,
      currentMonth: formatMonth(currentMonthData?.bulan),
      previousMonth: formatMonth(previousMonthData?.bulan),
      departemenId,
      scorePresensi: currentScorePresensi,
      scorePelatihan: currentScorePelatihan,
      bobotPresensi,
      bobotPelatihan
    };
  };

  // Cards and KPI stats
  const calculateAverageKPI = () => {
    if (!kpiBulanan || kpiBulanan.length === 0) return 0;
    // Calculate average from all department KPI finals
    const totalKPI = kpiBulanan.reduce((sum: number, item: any) => {
      return sum + (Number(item.kpiFinal) || 0);
    }, 0);
    const average = totalKPI / kpiBulanan.length;
    console.log('Average KPI Calculation:', { totalRecords: kpiBulanan.length, totalKPI, average });
    return Math.round(average);
  };

  const getCurrentMonthKPI = () => {
    if (!kpiBulanan || kpiBulanan.length === 0) return 0;
    // Get latest month data based on bulan parameter
    const monthsData = [...kpiBulanan].sort((a, b) => (a.bulan > b.bulan ? -1 : 1));
    const latestMonth = monthsData[0]?.bulan;
    if (!latestMonth) return 0;
    
    const currentMonthData = kpiBulanan.filter((item: any) => item.bulan === latestMonth);
    const monthlyKPI = currentMonthData.reduce((sum: number, item: any) => {
      return sum + (Number(item.kpiFinal) || 0);
    }, 0) / (currentMonthData.length || 1);
    
    console.log('Current Month KPI:', { month: latestMonth, departments: currentMonthData.length, average: monthlyKPI });
    return Math.round(monthlyKPI);
  };

  const getTotalEmployees = () => karyawan.length;

  // Helper function to get employees with KPI bulanan scores
  const getEmployeesWithKPIBulanan = (departmentName: string) => {
    // Handle "Semua Departemen" case
    if (departmentName === 'Semua Departemen') {
      // Get all employees from all departments
      const allEmployees: any[] = [];
      
      departments.forEach(dept => {
        const deptEmployees = (karyawan || []).filter(e =>
          e.departemen?.some((d: any) => d.nama === dept)
        );
        
        const departmentKPIData = (kpiBulanan || []).filter(item => item.departemen === dept);
        
        if (departmentKPIData.length > 0) {
          const sortedKPIData = [...departmentKPIData].sort((a, b) => (a.bulan > b.bulan ? 1 : -1));
          const latestKPIData = sortedKPIData[sortedKPIData.length - 1];
          
          const deptScorePresensi = Number(latestKPIData?.scorePresensi) || 0;
          const deptScorePelatihan = Number(latestKPIData?.scorePelatihan) || 0;
          const deptKpiFinal = Number(latestKPIData?.kpiFinal) || 0;
          const bobotPresensi = Number(latestKPIData?.bobotPresensi) || 0;
          const bobotPelatihan = Number(latestKPIData?.bobotPelatihan) || 0;
          const departemenId = latestKPIData?.departemenId;
          
          deptEmployees.forEach(employee => {
            allEmployees.push({
              ...employee,
              scoreKehadiran: deptScorePresensi,
              scorePelatihan: deptScorePelatihan,
              kpiFinal: deptKpiFinal,
              performance: deptKpiFinal,
              productivity: deptScorePelatihan,
              attendance: deptScorePresensi,
              rating: deptKpiFinal >= 90 ? 'Excellent' : deptKpiFinal >= 75 ? 'Good' : deptKpiFinal >= 60 ? 'Average' : 'Poor',
              departemenId,
              bobotPresensi,
              bobotPelatihan,
              departemenNama: dept // Add department name for display
            });
          });
        }
      });
      
      return allEmployees.sort((a: any, b: any) => (b.kpiFinal || 0) - (a.kpiFinal || 0));
    }

    const departmentEmployees = (karyawan || []).filter(e =>
      e.departemen?.some((d: any) => d.nama === departmentName)
    );

    // Get latest month's KPI data for the department
    const departmentKPIData = (kpiBulanan || []).filter(item => item.departemen === departmentName);

    if (departmentKPIData.length === 0) {
      // Return empty array if no KPI data - no dummy data
      return [];
    }

    // Get the latest month's data
    const sortedKPIData = [...departmentKPIData].sort((a, b) => (a.bulan > b.bulan ? 1 : -1));
    const latestKPIData = sortedKPIData[sortedKPIData.length - 1];

    return departmentEmployees.map((employee: any) => {
      // Extract KPI parameters from backend data structure  
      const deptScorePresensi = Number(latestKPIData?.scorePresensi) || 0;
      const deptScorePelatihan = Number(latestKPIData?.scorePelatihan) || 0;
      const deptKpiFinal = Number(latestKPIData?.kpiFinal) || 0;
      const bobotPresensi = Number(latestKPIData?.bobotPresensi) || 0;
      const bobotPelatihan = Number(latestKPIData?.bobotPelatihan) || 0;
      const departemenId = latestKPIData?.departemenId;
      
      // Use department baseline values directly - no artificial variation
      const employeeScoreKehadiran = deptScorePresensi;
      const employeeScorePelatihan = deptScorePelatihan;
      const employeeKpiFinal = deptKpiFinal;

      return {
        ...employee,
        scoreKehadiran: employeeScoreKehadiran,
        scorePelatihan: employeeScorePelatihan,
        kpiFinal: employeeKpiFinal,
        performance: employeeKpiFinal,
        productivity: employeeScorePelatihan,
        attendance: employeeScoreKehadiran,
        rating: employeeKpiFinal >= 90 ? 'Excellent' : employeeKpiFinal >= 75 ? 'Good' : employeeKpiFinal >= 60 ? 'Average' : 'Poor',
        departemenId,
        bobotPresensi,
        bobotPelatihan
      };
    }).sort((a: any, b: any) => (b.kpiFinal || 0) - (a.kpiFinal || 0));
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
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Average KPI (Last 12 Months)</CardTitle>
                  <CardDescription>Overall performance trend</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingKpi ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  ) : kpiBulanan.length === 0 ? (
                    <div>
                      <p className="text-3xl font-bold text-gray-400">0%</p>
                      <p className="text-sm text-muted-foreground">No KPI data available</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{calculateAverageKPI()}%</p>
                      <p className="text-sm text-muted-foreground">12-Month Average ({kpiBulanan.length} records)</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
              <CardHeader>
                <CardTitle>Current Month KPI</CardTitle>
                <CardDescription>This month's performance</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingKpi ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : kpiBulanan.length === 0 ? (
                  <div>
                    <p className="text-3xl font-bold text-gray-400">0%</p>
                    <p className="text-sm text-muted-foreground">No current data</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{getCurrentMonthKPI()}%</p>
                    <p className="text-sm text-muted-foreground">Monthly Average</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Employees</CardTitle>
                <CardDescription>Active employees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{getTotalEmployees()}</p>
                <p className="text-sm text-muted-foreground">All departments</p>
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
                // Convert kpiFinal variables for comparison: bulan ini vs bulan lalu
                const latestNum = Number(latest) || 0;  // kpiFinal bulan ini
                const prevNum = Number(prev) || 0;      // kpiFinal bulan lalu
                const trend = latestNum > prevNum ? 'up' : latestNum < prevNum ? 'down' : 'stable';
                const trendValue = latestNum - prevNum; // selisih bulan ini - bulan lalu
                const stats = { count: (karyawan || []).filter(k => k.departemen?.some((d: any) => d.nama === dept)).length || 0, avgPerformance: 0 };

                return (
                  <Card key={`dept-${dept}`} className="hover:shadow-lg transition-shadow duration-200" data-department-id={departemenId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{dept}</span>
                        <TrendIcon trend={trend} />
                      </CardTitle>
                      <CardDescription>KPI Final Comparison</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{latestNum.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">
                          KPI Final - {currentMonth}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Bulan Lalu:</span>
                        <span className="font-medium">{prevNum.toFixed(1)}% ({previousMonth})</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Selisih:</span>
                        <span className={`font-medium ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trendValue >= 0 ? '+' : ''}{trendValue.toFixed(1)}%
                        </span>
                      </div>
                      <div className="pt-2 border-t space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{stats.count}</span> employees
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg Performance: <span className="font-medium text-foreground">{latestNum.toFixed(1)}%</span>
                        </p>
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
                              <span className="text-sm min-w-[35px]">{(employee.kpiFinal || 0).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                <div className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300" style={{ width: `${employee.scorePelatihan || 0}%` }} />
                              </div>
                              <span className="text-sm min-w-[35px]">{(employee.scorePelatihan || 0).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                <div className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full transition-all duration-300" style={{ width: `${employee.scoreKehadiran || 0}%` }} />
                              </div>
                              <span className="text-sm min-w-[35px]">{(employee.scoreKehadiran || 0).toFixed(1)}%</span>
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
    </div>
  );
};

export default Dashboard;
