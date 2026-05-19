import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import logoImg from '../../logo/cropped_circle_image.png';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06)_0%,_transparent_60%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#d4af37]/3 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#d4af37]/2 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img
              src={logoImg}
              alt="Reborn Salon Logo"
              className="w-16 h-16 rounded-full object-cover shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            />
          </div>
          <h1 className="text-3xl font-black text-white">
            <span className="text-[#d4af37]">Reborn Unisex</span> SALON
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Owner Dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#111]/80 border border-[#d4af37]/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in to manage your salon
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-[#1a1a1a] border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all placeholder-gray-600"
              />
            </div>

            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                minLength={6}
                className="w-full bg-[#1a1a1a] border border-white/10 text-white pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#d4af37] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>


        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Back to <a href="#home" className="text-[#d4af37] hover:underline">salon website</a>
        </p>
      </div>
    </div>
  );
}
