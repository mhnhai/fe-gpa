import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { gpaAPI, semesterAPI } from '../api/axios';
import {
  Plus,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  Trash2,
  Edit3,
  X,
  Loader2,
  GraduationCap,
  Filter,
  RotateCcw
} from 'lucide-react';

// Helper function to generate semester name
const generateSemesterName = (year, semesterNumber) => {
  const semesterLabel = semesterNumber === 3 ? 'HK3' : `HK${semesterNumber}`;
  return `${semesterLabel} - Năm học ${year} - ${year + 1}`;
};

// Generate year options (from 2020 to current year + 5)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2020; y <= currentYear + 5; y++) {
    years.push(y);
  }
  return years;
};

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [newSemester, setNewSemester] = useState({
    year: new Date().getFullYear(),
    semester_number: 1,
  });
  
  // Filter states
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  useEffect(() => {
    fetchSummary();
  }, []);
  
  // Get unique years from semesters for filter
  const getAvailableYears = () => {
    if (!summary?.semesters) return [];
    const years = [...new Set(summary.semesters.map(s => s.year))];
    return years.sort((a, b) => b - a);
  };
  
  // Filter semesters
  const filteredSemesters = summary?.semesters?.filter(semester => {
    const matchYear = filterYear === 'all' || semester.year === parseInt(filterYear);
    const matchSemester = filterSemester === 'all' || semester.semester_number === parseInt(filterSemester);
    return matchYear && matchSemester;
  }) || [];
  
  const resetFilters = () => {
    setFilterYear('all');
    setFilterSemester('all');
  };

  const fetchSummary = async () => {
    try {
      const response = await gpaAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    
    const generatedName = generateSemesterName(newSemester.year, newSemester.semester_number);

    try {
      await semesterAPI.create({
        name: generatedName,
        year: newSemester.year,
        semester_number: newSemester.semester_number,
      });
      toast.success('Thêm học kỳ thành công!');
      setShowAddModal(false);
      setNewSemester({ year: new Date().getFullYear(), semester_number: 1 });
      fetchSummary();
    } catch (error) {
      toast.error('Không thể thêm học kỳ');
    }
  };

  const handleEditSemester = async (e) => {
    e.preventDefault();
    
    const generatedName = generateSemesterName(editingSemester.year, editingSemester.semester_number);
    
    try {
      await semesterAPI.update(editingSemester.id, {
        name: generatedName,
        year: editingSemester.year,
        semester_number: editingSemester.semester_number,
      });
      toast.success('Cập nhật học kỳ thành công!');
      setShowEditModal(false);
      setEditingSemester(null);
      fetchSummary();
    } catch (error) {
      toast.error('Không thể cập nhật học kỳ');
    }
  };

  const handleDeleteSemester = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${name}"? Tất cả môn học trong học kỳ này cũng sẽ bị xóa.`)) {
      return;
    }

    try {
      await semesterAPI.delete(id);
      toast.success('Xóa học kỳ thành công!');
      fetchSummary();
    } catch (error) {
      toast.error('Không thể xóa học kỳ');
    }
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.6) return 'text-emerald-400';
    if (gpa >= 3.2) return 'text-green-400';
    if (gpa >= 2.5) return 'text-yellow-400';
    if (gpa >= 2.0) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGPAGradient = (gpa) => {
    if (gpa >= 3.6) return 'from-emerald-500 to-green-500';
    if (gpa >= 3.2) return 'from-green-500 to-lime-500';
    if (gpa >= 2.5) return 'from-yellow-500 to-amber-500';
    if (gpa >= 2.0) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">GPA Tích lũy</p>
              <p className={`text-4xl font-bold font-mono ${getGPAColor(summary?.cumulative_gpa || 0)}`}>
                {(summary?.cumulative_gpa || 0).toFixed(2)}
              </p>
              <p className="text-slate-500 text-sm mt-1">/ 4.00</p>
            </div>
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGPAGradient(summary?.cumulative_gpa || 0)} flex items-center justify-center`}>
              <Award className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((summary?.cumulative_gpa || 0) / 4) * 100}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className={`h-full bg-gradient-to-r ${getGPAGradient(summary?.cumulative_gpa || 0)} rounded-full`}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Tổng tín chỉ</p>
              <p className="text-4xl font-bold font-mono text-primary-400">
                {summary?.total_credits || 0}
              </p>
              <p className="text-slate-500 text-sm mt-1">tín chỉ</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Semesters Section */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              Danh sách học kỳ
              {summary?.semesters?.length > 0 && (
                <span className="text-sm font-normal text-slate-400">
                  ({filteredSemesters.length}/{summary.semesters.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm học kỳ
            </button>
          </div>
          
          {/* Filters */}
          {summary?.semesters?.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Lọc:</span>
              </div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="input-field py-2 px-3 text-sm w-auto min-w-[140px]"
              >
                <option value="all">Tất cả năm học</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>
                    {year} - {year + 1}
                  </option>
                ))}
              </select>
              {(filterYear !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa lọc
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {summary?.semesters?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Chưa có học kỳ nào
            </h3>
            <p className="text-slate-400 mb-6">
              Bắt đầu bằng cách thêm học kỳ đầu tiên của bạn
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm học kỳ
            </button>
          </div>
        ) : filteredSemesters.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <Filter className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Không tìm thấy học kỳ
            </h3>
            <p className="text-slate-400 mb-4">
              Không có học kỳ nào phù hợp với bộ lọc
            </p>
            <button
              onClick={resetFilters}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredSemesters.map((semester, index) => (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-primary-500/30 transition-all overflow-hidden"
              >
                <Link
                  to={`/semester/${semester.id}`}
                  className="block p-4"
                >
                  {/* Top row: Name and GPA */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white hover:text-primary-300 transition-colors">
                        {semester.name}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold font-mono ${getGPAColor(semester.semester_gpa)}`}>
                        {semester.semester_gpa.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">GPA</p>
                    </div>
                  </div>
                  
                  {/* Bottom row: Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">
                        <span className="text-slate-500">Môn:</span>{' '}
                        <span className="text-white font-medium">{semester.courses.length}</span>
                      </span>
                      <span className="text-slate-400">
                        <span className="text-slate-500">TC:</span>{' '}
                        <span className="text-white font-medium">{semester.total_credits}</span>
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                </Link>
                
                {/* Action buttons */}
                <div className="flex border-t border-slate-700/50">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingSemester(semester);
                      setShowEditModal(true);
                    }}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-blue-400 hover:bg-blue-500/10 transition-all border-r border-slate-700/50"
                  >
                    <Edit3 className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteSemester(semester.id, semester.name);
                    }}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Semester Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Thêm học kỳ mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSemester} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Năm học
                    </label>
                    <select
                      value={newSemester.year}
                      onChange={(e) => setNewSemester({ ...newSemester, year: parseInt(e.target.value) })}
                      className="input-field"
                    >
                      {generateYearOptions().map(year => (
                        <option key={year} value={year}>
                          {year} - {year + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Học kỳ
                    </label>
                    <select
                      value={newSemester.semester_number}
                      onChange={(e) => setNewSemester({ ...newSemester, semester_number: parseInt(e.target.value) })}
                      className="input-field"
                    >
                      <option value={1}>Học kỳ 1</option>
                      <option value={2}>Học kỳ 2</option>
                      <option value={3}>Học kỳ 3</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                  <p className="text-sm text-slate-400 mb-1">Tên học kỳ sẽ tạo:</p>
                  <p className="text-lg font-semibold text-primary-300">
                    {generateSemesterName(newSemester.year, newSemester.semester_number)}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Thêm học kỳ
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Semester Modal */}
      <AnimatePresence>
        {showEditModal && editingSemester && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Chỉnh sửa học kỳ</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSemester} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Năm học
                    </label>
                    <select
                      value={editingSemester.year}
                      onChange={(e) => setEditingSemester({ ...editingSemester, year: parseInt(e.target.value) })}
                      className="input-field"
                    >
                      {generateYearOptions().map(year => (
                        <option key={year} value={year}>
                          {year} - {year + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Học kỳ
                    </label>
                    <select
                      value={editingSemester.semester_number}
                      onChange={(e) => setEditingSemester({ ...editingSemester, semester_number: parseInt(e.target.value) })}
                      className="input-field"
                    >
                      <option value={1}>Học kỳ 1</option>
                      <option value={2}>Học kỳ 2</option>
                      <option value={3}>Học kỳ 3</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                  <p className="text-sm text-slate-400 mb-1">Tên học kỳ:</p>
                  <p className="text-lg font-semibold text-primary-300">
                    {generateSemesterName(editingSemester.year, editingSemester.semester_number)}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;

