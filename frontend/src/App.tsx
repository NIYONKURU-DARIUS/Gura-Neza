import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatWidget from './components/ChatWidget';
import LoadingScreen from './components/LoadingScreen';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './context/store';
import { userService } from './services/userService';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useStore();
  const location = useLocation();

  if (!token && !localStorage.getItem('gura_token')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useStore();
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/products" replace />;
  }
  return <>{children}</>;
};

// Inner component so we can use useLocation inside Router
function AppRoutes() {
  const location = useLocation();
  // Hide chat on public/auth pages and admin — show on all user pages
  const hideChatOn = ['/', '/login', '/register'];
  const showChat = !hideChatOn.includes(location.pathname) &&
                   !location.pathname.startsWith('/admin');

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/products" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
      {showChat && <ChatWidget />}
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, fetchCart } = useStore();

  useEffect(() => {
    const initApp = async () => {
      const storedToken = localStorage.getItem('gura_token');
      
      // Hard timeout to prevent stuck loading screen
      const timeoutId = setTimeout(() => setIsLoading(false), 5000);

      if (storedToken) {
        try {
          const user = await userService.getMe();
          setUser({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            walletBalance: user.walletBalance
          });
          await fetchCart();
        } catch (err) {
          console.error("Session expired or invalid:", err);
          localStorage.removeItem('gura_token');
          // Important: clear the user state if fetch fails
          setUser(null);
        }
      }
      
      // Normal completion
      clearTimeout(timeoutId);
      setTimeout(() => setIsLoading(false), 800);
    };

    initApp();
  }, [setUser]);

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <Router>
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;
