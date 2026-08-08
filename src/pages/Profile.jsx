import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/axios';
import toast from 'react-hot-toast';
import { Loader2, Lock, Save, UserRound } from 'lucide-react';

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(', ');
  }
  return fallback;
}

function Profile() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email không được để trống');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile({
        full_name: fullName.trim() || null,
        email: email.trim(),
      });
      updateUser(res.data);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cập nhật hồ sơ thất bại'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin mật khẩu');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Đổi mật khẩu thất bại'));
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Hồ sơ người dùng</h1>
        <p className="text-slate-400">Xem và cập nhật thông tin tài khoản của bạn</p>
      </div>

      <section className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-emerald to-primary-500 flex items-center justify-center">
            <UserRound className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Thông tin cá nhân</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                className="input-field opacity-70 cursor-not-allowed"
                value={user.username || ''}
                disabled
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Khóa học
              </label>
              <input
                type="text"
                className="input-field opacity-70 cursor-not-allowed"
                value={
                  user.cohort
                    ? `${user.cohort.code}${user.cohort.name ? ` - ${user.cohort.name}` : ''}`
                    : 'Chưa gán'
                }
                disabled
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ngành học
              </label>
              <input
                type="text"
                className="input-field opacity-70 cursor-not-allowed"
                value={user.major?.name || 'Chưa gán'}
                disabled
                readOnly
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary inline-flex items-center gap-2"
          >
            {savingProfile ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </form>
      </section>

      <section className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-violet flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Đổi mật khẩu</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mật khẩu cũ
            </label>
            <input
              type="password"
              className="input-field"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nhập lại mật khẩu mới
            </label>
            <input
              type="password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="btn-primary inline-flex items-center gap-2"
          >
            {savingPassword ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Đổi mật khẩu
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Profile;
