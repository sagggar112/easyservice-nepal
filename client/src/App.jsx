import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Booking from "./pages/Booking";
import Bookings from "./pages/Bookings";
import Home from "./pages/Home";
import Services from "./pages/Services";
import SmartMatch from "./pages/SmartMatch";
import AIAssistant from "./pages/AIAssistant";
import ProviderDashboard from "./pages/ProviderDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Providers from "./admin/pages/Providers";
import AdminServices from "./admin/pages/Services";
import AdminBookings from "./admin/pages/Bookings";
import Reviews from "./admin/pages/Reviews";
import Settings from "./admin/pages/Settings";

function PublicLayout({ children }) { return <><Navbar /><main>{children}</main><Footer /></>; }

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/smart-match" element={<PublicLayout><SmartMatch /></PublicLayout>} />
          <Route path="/ai-assistant" element={<PublicLayout><AIAssistant /></PublicLayout>} />
          <Route path="/provider/dashboard" element={<PublicLayout><ProviderDashboard /></PublicLayout>} />
          <Route path="/booking/:serviceId" element={<PublicLayout><Booking /></PublicLayout>} />
          <Route path="/bookings" element={<PublicLayout><Bookings /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
          <Route path="/profile/edit" element={<PublicLayout><EditProfile /></PublicLayout>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="providers" element={<Providers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
