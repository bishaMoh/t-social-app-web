import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto max-w-7xl flex justify-center pb-16 md:pb-0">
      {/* Left Sidebar (Nav) */}
      <div className="hidden md:block w-[88px] lg:w-[275px]">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[600px] border-x min-h-screen border-border/50 relative">
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[350px]">
        <RightSidebar />
      </div>

      {/* Mobile Nav is rendered within Sidebar component but sits fixed at bottom */}
      <div className="md:hidden">
        <Sidebar />
      </div>
    </div>
  );
}
