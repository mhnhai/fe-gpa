import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { GraduationCap, Loader2, KeyRound, Mail, ShieldCheck } from 'lucide-react';

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(', ');
  }
  return fallback;
}

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 email, 2 otp, 3 new password
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const stepTitle = useMemo(() => {
    if (step === 1) return 'Quên mật khẩu';
    if (step === 2) return 'Nhập mã OTP';
    return 'Tạo mật khẩu mới';
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email.trim());
      setMaskedEmail(res.data.masked_email);
      toast.success(res.data.message || 'Đã gửi mã OTP');
      setStep(2);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không gửi được OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error('OTP phải gồm đúng 6 chữ số');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(email.trim(), otp);
      setResetToken(res.data.reset_token);
      toast.success('Xác thực OTP thành công');
      setStep(3);
    } catch (error) {
      toast.error(getErrorMessage(error, 'OTP không đúng'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Đặt lại mật khẩu thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-400 via-accent-violet to-accent-emerald flex items-center justify-center shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">{stepTitle}</h1>
          <p className="text-slate-400">
            {step === 1 && 'Nhập email đã đăng ký để nhận mã OTP'}
            {step === 2 && `Đã gửi mã tới ${maskedEmail || 'email của bạn'}`}
            {step === 3 && 'Nhập mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-5 h-5" /> Gửi mã OTP</>}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mã OTP 6 số</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="input-field tracking-[0.4em] text-center text-xl"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">Mã có hiệu lực trong 5 phút</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Xác nhận OTP</>}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="w-full text-sm text-primary-400 hover:text-primary-300"
              >
                Gửi lại mã
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  className="input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-5 h-5" /> Đặt lại mật khẩu</>}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
