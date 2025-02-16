import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

class AuthService {
  private apiUrl = 'http://localhost:5000/api/vendors';

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(new Date().getTime() / 1000);

    return decodedToken.exp < currentTime;
  }

  public async refreshToken(): Promise<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      const response = await axios.post(`${this.apiUrl}/auth/refresh`, {
        refresh_token: refreshToken
      });
      
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed', error);
      this.logout();
      throw error;
    }
  }

  public scheduleAutoLogout(): void {
    const token = this.getToken();
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000 - Date.now();

      setTimeout(() => this.logout(), expiryTime);
    }
  }

  public notifyBeforeExpiry(): void {
    const token = this.getToken();
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000 - Date.now();

      setTimeout(() => {
        alert(
          'Your session will expire soon. Please save your work or refresh your session.'
        );
      }, expiryTime - 5 * 60 * 1000);
    }
  }

  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();

export const useAuthService = () => {
  const navigate = useNavigate();

  return {
    isAuthenticated: () => authService.isAuthenticated(),
    getToken: () => authService.getToken(),
    isTokenExpired: () => authService.isTokenExpired(),
    refreshToken: () => authService.refreshToken(),
    scheduleAutoLogout: () => authService.scheduleAutoLogout(),
    notifyBeforeExpiry: () => authService.notifyBeforeExpiry(),
    logout: () => {
      authService.logout();
      navigate('/auth/login');
    },
  };
};