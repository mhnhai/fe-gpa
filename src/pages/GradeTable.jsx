import { motion } from 'framer-motion';
import { Table, Calculator, Info } from 'lucide-react';

const gradeData = [
  { range: '9.0 - 10.0', letter: 'A', point: 4.0, color: 'emerald' },
  { range: '8.0 - 8.9', letter: 'B+', point: 3.5, color: 'green' },
  { range: '7.0 - 7.9', letter: 'B', point: 3.0, color: 'lime' },
  { range: '6.5 - 6.9', letter: 'C+', point: 2.5, color: 'yellow' },
  { range: '5.5 - 6.4', letter: 'C', point: 2.0, color: 'amber' },
  { range: '5.0 - 5.4', letter: 'D+', point: 1.5, color: 'orange' },
  { range: '4.0 - 4.9', letter: 'D', point: 1.0, color: 'red' },
  { range: '< 4.0', letter: 'F', point: 0.0, color: 'rose' },
];

const colorClasses = {
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  lime: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

function GradeTable() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center">
          <Table className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Bảng Quy Đổi Điểm
        </h1>
        <p className="text-slate-400">
          Quy đổi điểm số thang 10 sang điểm chữ và thang điểm 4
        </p>
      </motion.div>

      {/* Grade Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-700/50">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-primary-400" />
            Bảng quy đổi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                  Điểm số (thang 10)
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-slate-300">
                  Điểm chữ
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-slate-300">
                  Điểm số (thang 4)
                </th>
              </tr>
            </thead>
            <tbody>
              {gradeData.map((grade, index) => (
                <motion.tr
                  key={grade.letter}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="font-mono text-white">{grade.range}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${colorClasses[grade.color]}`}>
                      {grade.letter}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-mono text-xl font-bold text-white">
                      {grade.point.toFixed(1)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Formula Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="text-center">
          <h3 className="font-semibold text-white text-lg mb-3">
            Công thức tính điểm trung bình chung
          </h3>
          <div className="glass rounded-xl p-4 mb-4 inline-block">
            <p className="text-2xl font-mono text-primary-300">
              ĐTBCHK = Σ(a<sub>i</sub> × X<sub>i</sub>) / Σ(a<sub>i</sub>)
            </p>
          </div>
          <div className="space-y-2 text-slate-300 max-w-md mx-auto text-left">
            <p className="flex items-start gap-2 justify-center">
              <span className="text-primary-400 font-mono">ĐTBCHK</span>
              <span>: Điểm trung bình chung học kỳ</span>
            </p>
            <p className="flex items-start gap-2 justify-center">
              <span className="text-primary-400 font-mono">a<sub>i</sub></span>
              <span>: Số tín chỉ của môn học thứ i</span>
            </p>
            <p className="flex items-start gap-2 justify-center">
              <span className="text-primary-400 font-mono">X<sub>i</sub></span>
              <span>: Điểm hệ 4 của môn học thứ i</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Example Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="text-center">
          <h3 className="font-semibold text-white text-lg mb-4">
            Ví dụ minh họa
          </h3>
          <div className="overflow-x-auto inline-block w-full max-w-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-2 px-3 text-slate-400">Môn học</th>
                  <th className="text-center py-2 px-3 text-slate-400">Tín chỉ (a)</th>
                  <th className="text-center py-2 px-3 text-slate-400">Điểm hệ 4 (X)</th>
                  <th className="text-center py-2 px-3 text-slate-400">a × X</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-700/30">
                  <td className="py-2 px-3 text-left">Toán cao cấp</td>
                  <td className="text-center py-2 px-3">3</td>
                  <td className="text-center py-2 px-3 text-green-400">3.5</td>
                  <td className="text-center py-2 px-3 font-mono">10.5</td>
                </tr>
                <tr className="border-b border-slate-700/30">
                  <td className="py-2 px-3 text-left">Lập trình C</td>
                  <td className="text-center py-2 px-3">4</td>
                  <td className="text-center py-2 px-3 text-emerald-400">4.0</td>
                  <td className="text-center py-2 px-3 font-mono">16.0</td>
                </tr>
                <tr className="border-b border-slate-700/30">
                  <td className="py-2 px-3 text-left">Vật lý đại cương</td>
                  <td className="text-center py-2 px-3">3</td>
                  <td className="text-center py-2 px-3 text-lime-400">3.0</td>
                  <td className="text-center py-2 px-3 font-mono">9.0</td>
                </tr>
                <tr className="bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-white text-left">Tổng</td>
                  <td className="text-center py-3 px-3 font-semibold text-white">10</td>
                  <td className="text-center py-3 px-3"></td>
                  <td className="text-center py-3 px-3 font-mono font-semibold text-white">35.5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 glass rounded-xl max-w-lg mx-auto">
            <p className="text-slate-300">
              <span className="font-semibold text-white">Kết quả: </span>
              ĐTBCHK = 35.5 / 10 = <span className="text-2xl font-bold text-primary-400 font-mono">3.55</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* GPA Classification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="font-semibold text-white text-lg mb-4">
          Phân loại học lực theo GPA
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 text-center border border-emerald-500/30">
            <p className="text-sm text-slate-400 mb-1">Xuất sắc</p>
            <p className="text-xl font-bold font-mono text-emerald-400">≥ 3.6</p>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-green-500/30">
            <p className="text-sm text-slate-400 mb-1">Giỏi</p>
            <p className="text-xl font-bold font-mono text-green-400">3.2 - 3.59</p>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-yellow-500/30">
            <p className="text-sm text-slate-400 mb-1">Khá</p>
            <p className="text-xl font-bold font-mono text-yellow-400">2.5 - 3.19</p>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-orange-500/30">
            <p className="text-sm text-slate-400 mb-1">Trung bình</p>
            <p className="text-xl font-bold font-mono text-orange-400">2.0 - 2.49</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default GradeTable;

