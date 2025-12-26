import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Hermes" className="h-16 w-16" />
            <span className="text-xl font-semibold text-white">Hermes Mail</span>
          </button>

          {/* Register Button */}
          <button
            onClick={register}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {/* Glowing orb effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center">
                  <img src="/logo.png" alt="Hermes" className="w-10 h-10" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Welcome back
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign in to continue to your inbox
            </p>

            <div className="space-y-4">
              <button
                onClick={login}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20"
              >
                Sign In
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800/50 text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={register}
                className="w-full py-3 px-4 border border-slate-600 text-gray-300 font-medium rounded-xl hover:bg-slate-700/50 hover:border-slate-500 transition-all"
              >
                Create an Account
              </button>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-gray-500 text-sm mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
