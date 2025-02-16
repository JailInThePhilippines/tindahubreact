import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthService } from '../services/auth-service';
import { apiService } from '../services/api-service';
import Swal from 'sweetalert2';

interface LoginFormInputs {
  vendor_email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormInputs>();
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { isAuthenticated } = useAuthService();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/vendor/dashboard');
    }
    checkGoogleAuthResponse();
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    if (!isValid) return;

    setLoading(true);
    setClicked(true);

    try {
      const response = await apiService.login(data.vendor_email, data.password);
      
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);

        const vendorInfo = {
          id: response.data.vendor.id,
          accountId: response.data.vendor.accountId,
          vendor_name: response.data.vendor.vendor_name,
          vendor_email: response.data.vendor.vendor_email,
          location: response.data.vendor.location,
          rating: response.data.vendor.rating,
          description: response.data.vendor.description,
          operating_hours: response.data.vendor.operating_hours,
          vendor_profile_image: response.data.vendor.vendor_profile_image
        };
        localStorage.setItem('vendorInfo', JSON.stringify(vendorInfo));

        if (data.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        navigate('/vendor/dashboard');
      }
    } catch (error: any) {
      Swal.fire(
        'Error!',
        error.response?.data?.message || 'An error occurred while logging in.',
        'error'
      );
    } finally {
      setLoading(false);
      setClicked(false);
    }
  };

  const loginWithGoogle = () => {
    apiService.loginWithGoogle();
  };

  const checkGoogleAuthResponse = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const vendorData = urlParams.get('vendor');

    if (token && vendorData) {
      localStorage.setItem('authToken', token);
      try {
        const vendor = JSON.parse(decodeURIComponent(vendorData));
        localStorage.setItem('vendorInfo', JSON.stringify(vendor));
        navigate('/vendor/dashboard');
      } catch (error) {
        Swal.fire('Error!', 'Failed to process login data.', 'error');
      }
    } else if (urlParams.get('error')) {
      Swal.fire('Error!', 'Google login failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div>
            <img src="/unimartLogo.png" className="w-32 mx-auto" alt="Unimart Logo" />
          </div>
          
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">WELCOME!</h1>
            <p className="text-sm text-gray-600">Access your account</p>

            {/* Google Login Button */}
            <div className="w-full flex-1 mt-8">
              <div className="flex flex-col items-center">
                <button
                  onClick={loginWithGoogle}
                  className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                >
                  <div className="bg-white p-2 rounded-full">
                    {/* Google SVG Icon */}
                    <svg className="w-4" viewBox="0 0 533.5 544.3">
                    <path
                    d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                    fill="#4285f4" />
                  <path
                    d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                    fill="#34a853" />
                  <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                    fill="#fbbc04" />
                  <path
                    d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                    fill="#ea4335" />
                    </svg>
                  </div>
                  <span className="ml-4">Sign Up with Google</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="my-12 border-b text-center">
              <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                Or log in with your email
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-6">
              <div className="mb-5">
                <input
                  {...register('vendor_email', { 
                    required: true, 
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i 
                  })}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Email"
                />
                {errors.vendor_email && (
                  <span className="text-red-500 text-xs mt-1">Valid email is required</span>
                )}
              </div>

              <div className="mb-5">
                <input
                  {...register('password', { required: true })}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Password"
                />
                {errors.password && (
                  <span className="text-red-500 text-xs mt-1">Password is required</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-sm">Remember Me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-indigo-500 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="mt-6 w-full py-4 text-white bg-indigo-500 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center"
              >
                {clicked ? 'Loading...' : 'Log in'}
              </button>

              <p className="text-center mt-4 text-sm">
                Need an account?{' '}
                <a href="/auth/register" className="text-indigo-500 hover:underline">
                  Register Now
                </a>
              </p>
            </form>
          </div>
        </div>

        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;