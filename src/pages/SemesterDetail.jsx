import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { semesterAPI, courseAPI, catalogAPI, gpaAPI } from '../api/axios';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  BookOpen,
  Award,
  Hash,
  FileText,
  Search,
  CheckSquare,
  Square,
  Library
} from 'lucide-react';

// Grade options with corresponding score
const GRADE_OPTIONS = [
  { letter: 'A', score: 9.5, point: 4.0, label: 'A (9.0-10.0)' },
  { letter: 'B+', score: 8.5, point: 3.5, label: 'B+ (8.0-8.9)' },
  { letter: 'B', score: 7.5, point: 3.0, label: 'B (7.0-7.9)' },
  { letter: 'C+', score: 6.75, point: 2.5, label: 'C+ (6.5-6.9)' },
  { letter: 'C', score: 6.0, point: 2.0, label: 'C (5.5-6.4)' },
  { letter: 'D+', score: 5.25, point: 1.5, label: 'D+ (5.0-5.4)' },
  { letter: 'D', score: 4.5, point: 1.0, label: 'D (4.0-4.9)' },
  { letter: 'F', score: 2.0, point: 0.0, label: 'F (< 4.0)' },
];

const getScoreFromLetter = (letter) => {
  const grade = GRADE_OPTIONS.find(g => g.letter === letter);
  return grade ? grade.score : 0;
};

const getLetterFromScore = (score) => {
  if (score >= 9.0) return 'A';
  if (score >= 8.0) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'D+';
  if (score >= 4.0) return 'D';
  return 'F';
};

function SemesterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [semester, setSemester] = useState(null);
  const [gpaSummary, setGpaSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    course_name: '',
    credits: '3',
    letter_grade: 'A',
  });
  
  // Catalog states
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    fetchSemester();
    fetchGpaSummary();
  }, [id]);
  
  useEffect(() => {
    if (showCatalogModal) {
      fetchCatalog();
    }
  }, [showCatalogModal, catalogSearch]);

  const fetchSemester = async () => {
    try {
      const response = await semesterAPI.getOne(id);
      setSemester(response.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu học kỳ');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchGpaSummary = async () => {
    try {
      const response = await gpaAPI.getSummary();
      setGpaSummary(response.data);
    } catch (error) {
      console.error('Không thể tải GPA tích lũy');
    }
  };
  
  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      const response = await catalogAPI.getAll(catalogSearch);
      setCatalogCourses(response.data);
    } catch (error) {
      toast.error('Không thể tải kho môn học');
    } finally {
      setCatalogLoading(false);
    }
  };
  
  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };
  
  const selectAllFiltered = () => {
    const existingCodes = new Set(semester?.courses?.map(c => c.course_code) || []);
    const availableCourses = catalogCourses.filter(c => !existingCodes.has(c.course_code));
    setSelectedCourses(availableCourses.map(c => c.id));
  };
  
  const deselectAll = () => {
    setSelectedCourses([]);
  };
  
  const handleBulkAdd = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Vui lòng chọn ít nhất một môn học');
      return;
    }
    
    try {
      await catalogAPI.bulkAdd({
        semester_id: parseInt(id),
        course_ids: selectedCourses,
        default_score: 0
      });
      toast.success(`Đã thêm ${selectedCourses.length} môn học!`);
      setShowCatalogModal(false);
      setSelectedCourses([]);
      setCatalogSearch('');
      fetchSemester();
      fetchGpaSummary();
    } catch (error) {
      toast.error('Không thể thêm môn học');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.course_code || !newCourse.course_name) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const score = getScoreFromLetter(newCourse.letter_grade);
    const credits = parseInt(newCourse.credits) || 1;

    try {
      await courseAPI.create({ 
        course_code: newCourse.course_code,
        course_name: newCourse.course_name,
        credits: credits,
        score: score,
        semester_id: parseInt(id) 
      });
      toast.success('Thêm môn học thành công!');
      setShowAddModal(false);
      setNewCourse({ course_code: '', course_name: '', credits: '3', letter_grade: 'A' });
      fetchSemester();
      fetchGpaSummary();
    } catch (error) {
      toast.error('Không thể thêm môn học');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    
    const score = getScoreFromLetter(editingCourse.letter_grade);
    const credits = parseInt(editingCourse.credits) || 1;

    try {
      await courseAPI.update(editingCourse.id, {
        course_code: editingCourse.course_code,
        course_name: editingCourse.course_name,
        credits: credits,
        score: score,
      });
      toast.success('Cập nhật môn học thành công!');
      setShowEditModal(false);
      setEditingCourse(null);
      fetchSemester();
      fetchGpaSummary();
    } catch (error) {
      toast.error('Không thể cập nhật môn học');
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa môn "${courseName}"?`)) {
      return;
    }

    try {
      await courseAPI.delete(courseId);
      toast.success('Xóa môn học thành công!');
      fetchSemester();
      fetchGpaSummary();
    } catch (error) {
      toast.error('Không thể xóa môn học');
    }
  };

  const getGradeColor = (letterGrade) => {
    const colors = {
      'A': 'text-emerald-400 bg-emerald-500/20',
      'B+': 'text-green-400 bg-green-500/20',
      'B': 'text-lime-400 bg-lime-500/20',
      'C+': 'text-yellow-400 bg-yellow-500/20',
      'C': 'text-amber-400 bg-amber-500/20',
      'D+': 'text-orange-400 bg-orange-500/20',
      'D': 'text-red-400 bg-red-500/20',
      'F': 'text-rose-500 bg-rose-500/20',
    };
    return colors[letterGrade] || 'text-slate-400 bg-slate-500/20';
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.6) return 'text-emerald-400';
    if (gpa >= 3.2) return 'text-green-400';
    if (gpa >= 2.5) return 'text-yellow-400';
    if (gpa >= 2.0) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard"
          className="p-2 rounded-xl glass hover:bg-slate-700/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-white">
            {semester?.name}
          </h1>
          <p className="text-slate-400 text-sm">
            Năm {semester?.year} • Học kỳ {semester?.semester_number}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mb-1">GPA học kỳ</p>
            <p className={`text-2xl font-bold font-mono ${getGPAColor(semester?.semester_gpa || 0)}`}>
              {(semester?.semester_gpa || 0).toFixed(2)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 mb-1">GPA tích lũy</p>
            <p className={`text-2xl font-bold font-mono ${getGPAColor(gpaSummary?.cumulative_gpa || 0)}`}>
              {(gpaSummary?.cumulative_gpa || 0).toFixed(2)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center mb-2">
              <Hash className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Tín chỉ HK</p>
            <p className="text-2xl font-bold font-mono text-primary-400">
              {semester?.total_credits || 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-violet/20 to-purple-500/20 flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-accent-violet" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Số môn học</p>
            <p className="text-2xl font-bold font-mono text-accent-violet">
              {semester?.courses?.length || 0}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Courses Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-400" />
            Danh sách môn học
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCatalogModal(true)}
              className="btn-secondary text-sm py-2 flex items-center gap-2"
            >
              <Library className="w-4 h-4" />
              Chọn từ kho
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm thủ công
            </button>
          </div>
        </div>

        {semester?.courses?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Chưa có môn học nào
            </h3>
            <p className="text-slate-400 mb-4">
              Thêm môn học để tính điểm GPA
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm môn học
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {semester?.courses?.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all"
              >
                {/* Header row: Code, Grade, Actions */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm text-primary-400 font-medium shrink-0">
                      {course.course_code}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${getGradeColor(course.letter_grade)}`}>
                      {course.letter_grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingCourse({
                          ...course,
                          letter_grade: course.letter_grade || getLetterFromScore(course.score)
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all"
                      title="Sửa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.course_name)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Course name */}
                <h4 className="text-white text-sm font-medium mb-3 line-clamp-2">
                  {course.course_name}
                </h4>
                
                {/* Footer row: Credits and GPA */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">
                      <span className="text-slate-500">TC:</span>{' '}
                                          <span className="font-mono font-bold text-lg text-white">
{course.credits}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Điểm hệ 4:</span>
                    <span className="font-mono font-bold text-lg text-white">
                      {course.grade_point.toFixed(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Course Modal */}
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
                <h3 className="text-xl font-semibold text-white">Thêm môn học</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mã học phần
                  </label>
                  <input
                    type="text"
                    value={newCourse.course_code}
                    onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                    className="input-field"
                    placeholder="VD: INT1001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tên học phần
                  </label>
                  <input
                    type="text"
                    value={newCourse.course_name}
                    onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                    className="input-field"
                    placeholder="VD: Nhập môn lập trình"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Số tín chỉ
                    </label>
                    <input
                      type="number"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                      className="input-field"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Điểm chữ
                    </label>
                    <select
                      value={newCourse.letter_grade}
                      onChange={(e) => setNewCourse({ ...newCourse, letter_grade: e.target.value })}
                      className="input-field"
                    >
                      {GRADE_OPTIONS.map(grade => (
                        <option key={grade.letter} value={grade.letter}>
                          {grade.label} → {grade.point.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    Thêm môn học
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Course Modal */}
      <AnimatePresence>
        {showEditModal && editingCourse && (
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
                <h3 className="text-xl font-semibold text-white">Chỉnh sửa môn học</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mã học phần
                  </label>
                  <input
                    type="text"
                    value={editingCourse.course_code}
                    onChange={(e) => setEditingCourse({ ...editingCourse, course_code: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tên học phần
                  </label>
                  <input
                    type="text"
                    value={editingCourse.course_name}
                    onChange={(e) => setEditingCourse({ ...editingCourse, course_name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Số tín chỉ
                    </label>
                    <input
                      type="number"
                      value={editingCourse.credits}
                      onChange={(e) => setEditingCourse({ ...editingCourse, credits: e.target.value })}
                      className="input-field"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Điểm chữ
                    </label>
                    <select
                      value={editingCourse.letter_grade}
                      onChange={(e) => setEditingCourse({ ...editingCourse, letter_grade: e.target.value })}
                      className="input-field"
                    >
                      {GRADE_OPTIONS.map(grade => (
                        <option key={grade.letter} value={grade.letter}>
                          {grade.label} → {grade.point.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </div>
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

      {/* Course Catalog Modal */}
      <AnimatePresence>
        {showCatalogModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCatalogModal(false);
              setSelectedCourses([]);
              setCatalogSearch('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Library className="w-6 h-6 text-primary-400" />
                    Kho môn học
                  </h3>
                  <button
                    onClick={() => {
                      setShowCatalogModal(false);
                      setSelectedCourses([]);
                      setCatalogSearch('');
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="input-field pl-12"
                    placeholder="Tìm kiếm theo mã hoặc tên môn học..."
                  />
                </div>
                
                {/* Quick actions */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllFiltered}
                      className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      onClick={deselectAll}
                      className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                  <span className="text-sm text-slate-400">
                    Đã chọn: <span className="text-primary-400 font-semibold">{selectedCourses.length}</span> môn
                  </span>
                </div>
              </div>
              
              {/* Course List */}
              <div className="flex-1 overflow-y-auto p-4">
                {catalogLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                  </div>
                ) : catalogCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Không tìm thấy môn học nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {catalogCourses.map((course) => {
                      const isSelected = selectedCourses.includes(course.id);
                      const isAdded = semester?.courses?.some(c => c.course_code === course.course_code);
                      
                      return (
                        <div
                          key={course.id}
                          onClick={() => !isAdded && toggleCourseSelection(course.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isAdded 
                              ? 'bg-slate-800/30 border-slate-700/30 opacity-50 cursor-not-allowed'
                              : isSelected
                                ? 'bg-primary-500/10 border-primary-500/50'
                                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {isAdded ? (
                                <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center">
                                  <CheckSquare className="w-4 h-4 text-slate-500" />
                                </div>
                              ) : isSelected ? (
                                <CheckSquare className="w-6 h-6 text-primary-400" />
                              ) : (
                                <Square className="w-6 h-6 text-slate-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm text-primary-400 font-medium">
                                  {course.course_code}
                                </span>
                                {isAdded && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                                    Đã thêm
                                  </span>
                                )}
                              </div>
                              <p className="text-white truncate">{course.course_name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-sm text-slate-400">{course.credits} TC</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-slate-700/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCatalogModal(false);
                      setSelectedCourses([]);
                      setCatalogSearch('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleBulkAdd}
                    disabled={selectedCourses.length === 0}
                    className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                      selectedCourses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    Thêm {selectedCourses.length > 0 ? `${selectedCourses.length} môn` : 'môn học'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SemesterDetail;

