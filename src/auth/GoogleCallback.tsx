import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '../services/auth-service';
import Swal from 'sweetalert2';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthService();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const vendorData = urlParams.get('vendor');
        const error = urlParams.get('error');

        if (error) {
          console.error('Google auth error:', error);
          throw new Error(error);
        }

        if (!token || !vendorData) {
          throw new Error('Missing authentication data');
        }

        const vendor = JSON.parse(decodeURIComponent(vendorData));
        
        if (!vendor.id || !vendor.accountId || !vendor.vendor_email) {
          throw new Error('Invalid vendor data structure');
        }

        localStorage.clear();
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('vendorInfo', JSON.stringify(vendor));

        const storedToken = localStorage.getItem('authToken');
        const storedVendor = localStorage.getItem('vendorInfo');

        if (!storedToken || !storedVendor) {
          throw new Error('Failed to store authentication data');
        }

        await Swal.fire({
          title: 'Success!',
          text: 'Google login successful!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        if (!vendor.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/vendor/dashboard');
        }
      } catch (error) {
        console.error('Error processing Google login:', error);
        await Swal.fire({
          title: 'Error!',
          text: `Failed to process Google login: ${error instanceof Error ? error.message : 'Failed to process login data'}`,
          icon: 'error'
        });
        navigate('/auth/login');
      } finally {
        setIsProcessing(false);
      }
    };

    if (!isAuthenticated()) {
      handleCallback();
    } else {
      navigate('/vendor/dashboard');
      setIsProcessing(false);
    }
  }, [navigate]);

  if (!isProcessing) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing login...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;