import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signin') {
      if (email === 'admin@setu.in' && password === 'admin123') {
        setError('');
        onLogin();
      } else {
        setError('Invalid credentials. Hint: admin@setu.in / admin123');
      }
    } else {
      // For register, we can just login directly for demo purposes
      if (email && password) {
        onLogin();
      } else {
        setError('Please fill in all fields.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center font-sans relative">
      {/* Main Container - Mobile sized max-w on Desktop */}
      <div className="w-full max-w-[400px] bg-white min-h-screen flex flex-col shadow-2xl relative">
        
        {/* Top Header */}
        <div className="px-6 pt-10 pb-6 flex items-center">
          <button className="text-[#e82a5d] hover:bg-[#e82a5d]/10 p-2 rounded-full transition-colors flex items-center justify-center -ml-2">
            <span className="material-symbols-outlined font-bold text-xl">arrow_back</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 flex-1">
          <h1 className="text-[32px] font-bold text-[#e82a5d] mb-1">
            {activeTab === 'signin' ? 'Login' : 'Register'}
          </h1>
          <p className="text-[#595959] text-sm mb-10">
            Good morning, welcome to SETU.
          </p>

          <form onSubmit={handleSignIn} className="flex flex-col gap-5">
            {/* Email Input */}
            <div>
              <label className="block text-[#1a1a1a] text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@setu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm focus:outline-none focus:border-[#e82a5d] transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#1a1a1a] text-sm font-bold">
                  Password
                </label>
                {activeTab === 'signin' && (
                  <button type="button" className="text-[#e82a5d] text-xs font-bold hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm focus:outline-none focus:border-[#e82a5d] transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#595959] hover:text-[#1a1a1a] flex items-center justify-center p-1"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && <div className="text-red-500 text-xs font-bold">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#e82a5d] text-white font-bold text-sm py-4 rounded-full mt-2 hover:bg-[#d4194a] transition-colors"
            >
              {activeTab === 'signin' ? 'Sign In' : 'Register'}
            </button>
          </form>

          {/* Switch Mode Text */}
          <div className="text-center mt-6 text-sm text-[#595959]">
            {activeTab === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setActiveTab('register')} className="text-[#e82a5d] font-bold hover:underline">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setActiveTab('signin')} className="text-[#e82a5d] font-bold hover:underline">
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="w-full bg-white border-t border-[#f0f0f0] flex py-3 px-6 pb-6 mt-auto">
          <button 
            onClick={() => setActiveTab('signin')}
            className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
              activeTab === 'signin' 
                ? 'bg-[#ff94ae]/40 text-[#e82a5d] rounded-[30px]' 
                : 'text-[#8c8c8c]'
            }`}
          >
            <span className="material-symbols-outlined text-xl mb-1">login</span>
            <span className="text-[10px] font-bold">Sign In</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
              activeTab === 'register' 
                ? 'bg-[#ff94ae]/40 text-[#e82a5d] rounded-[30px]' 
                : 'text-[#8c8c8c]'
            }`}
          >
            <span className="material-symbols-outlined text-xl mb-1">person_add</span>
            <span className="text-[10px] font-bold">Register</span>
          </button>
        </div>

      </div>
    </div>
  );
};
