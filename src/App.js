import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { 
  LayoutDashboard, 
  Calendar, 
  List, 
  Plus, 
  Download, 
  Settings,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializeStorage, exportToCSV } from "@/lib/storage";
import { toast } from "sonner";

// Pages
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/CalendarPage";
import MaintenanceList from "@/pages/MaintenanceList";
import MaintenanceForm from "@/pages/MaintenanceForm";

// Sidebar Component
const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/calendario", icon: Calendar, label: "Calendario" },
    { to: "/lista", icon: List, label: "Elenco" },
    { to: "/nuova", icon: Plus, label: "Nuova" },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-zinc-200 z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 font-['Manrope']">Scadenziario</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center mx-auto">
            <Wrench className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive 
                ? 'bg-zinc-900 text-white' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Actions */}
      <div className="absolute bottom-20 left-0 right-0 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            exportToCSV();
            toast.success("Export completato", { description: "File CSV scaricato" });
          }}
          className={`w-full ${collapsed ? 'px-0' : ''}`}
          data-testid="export-csv-btn"
        >
          <Download className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Esporta CSV</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 left-0 right-0 mx-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
        data-testid="toggle-sidebar-btn"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        {!collapsed && <span>Comprimi</span>}
      </button>
    </aside>
  );
};

// Header Component
const Header = ({ collapsed }) => {
  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/50 z-30 transition-all duration-300 ${
        collapsed ? 'left-16' : 'left-64'
      }`}
      data-testid="header"
    >
      <div className="h-full flex items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 font-['Manrope']">
            Gestione Scadenziario Manutenzioni
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Dati salvati localmente</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Main Layout
const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="noise-overlay" />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header collapsed={collapsed} />
      <main 
        className={`pt-16 min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize localStorage with sample data if empty
    initializeStorage();
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/lista" element={<MaintenanceList />} />
          <Route path="/nuova" element={<MaintenanceForm />} />
          <Route path="/modifica/:id" element={<MaintenanceForm />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
