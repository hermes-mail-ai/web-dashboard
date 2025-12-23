import { login, register } from '../services/auth';

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Hermes</h1>
        <div className="space-y-4">
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Login
          </button>
          <button
            onClick={register}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
