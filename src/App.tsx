import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import GoogleCallback from './auth/GoogleCallback';
import Dashboard from './components/dashboard';
import Products from './components/products';
import Orders from './components/orders';
import AddProduct from './components/addProduct';
import EditProduct from './components/editProduct';
import Chat from './components/chat';
import Profile from './components/profile';
import Issues from './components/issues';
import CompleteProfile from './components/completeProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        <Route>
          <Route path="/vendor/profile" element={<Profile />} />
          <Route path="/vendor/dashboard" element={<Dashboard />} />
          <Route path="/vendor/products/view" element={<Products />} />
          <Route path="/vendor/orders" element={<Orders />} />
          <Route path="/vendor/products/add" element={<AddProduct />} />
          <Route path="/vendor/products/edit/:id" element={<EditProduct />} />
          <Route path="/vendor/chat" element={<Chat />} />
          <Route path="/vendor/issues" element={<Issues />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
