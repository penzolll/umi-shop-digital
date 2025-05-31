
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from './auth/AuthLayout';
import RegisterForm from './auth/RegisterForm';

const Register = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout 
      title="Buat Akun Baru"
      description="Daftar akun baru di UMI Store"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
