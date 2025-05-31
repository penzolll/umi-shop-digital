
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from './auth/AuthLayout';
import LoginForm from './auth/LoginForm';

const Login = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout 
      title="Selamat Datang"
      description="Masuk ke akun UMI Store Anda"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
