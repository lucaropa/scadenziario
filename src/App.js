import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { 
  LayoutDashboard, 
  Calendar, 
  List, 
  Plus, 
  Wrench,
  ChevronLeft,
  ChevronRight,
  Database,
  ClipboardList,
  FileDown,
  FileUp,
  Bell,
  BellOff,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  initializeStorage, 
  exportBackup, 
  importBackup,
  requestNotificationPermission,
  areNotificationsEnabled,
  getNotificationSettings,
  saveNotificationSettings,
  sendPendingReminders,
  checkAndSendReminders
} from "@/lib/storage";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Pages
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/CalendarPage";
import MaintenanceList from "@/pages/MaintenanceList";
import MaintenanceForm from "@/pages/MaintenanceForm";
import FacilityList from "@/pages/FacilityList";
import FacilityForm from "@/pages/FacilityForm";

// Notification Settings Dialog
const NotificationSettingsDialog = ({ open, onOpenChange }) => {
  const [settings, setSettings] = useState(getNotificationSettings());
  const [permissionGranted, setPermissionGranted] = useState(areNotificationsEnabled());

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermissionGranted(result.success);
    if (result.success) {
      toast.success("Notifiche abilitate!");
    } else {
      toast.error(result.message);
    }
  };

  const handleSave = () => {
    saveNotificationSettings(settings);
    toast.success("Impostazioni salvate");
    onOpenChange(false);
    
    // If enabled, check for reminders immediately
    if (settings.enabled && permissionGranted) {
      const count = sendPendingReminders();
      if (count > 0) {
        toast.info(`${count} promemoria inviati`);
      }
    }
  };

  const handleTestNotification = () => {
    if (!permissionGranted) {
      toast.error("Prima abilita le notifiche");
      return;
    }
    new Notification("Test Notifica", {
      body: "Le notifiche funzionano correttamente!",
      icon: "/favicon.ico"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Impostazioni Notifiche
          </DialogTitle>
          <DialogDescription>
            Configura i promemoria per le scadenze imminenti.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Permesso notifiche</p>
              <p className="text-xs text-zinc-500">
                {permissionGranted ? "Autorizzate" : "Non autorizzate"}
              </p>
            </div>
            {permissionGranted ? (
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            ) : (
              <Button size="sm" onClick={handleRequestPermission}>
                Autorizza
              </Button>
            )}
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled">Abilita notifiche</Label>
              <p className="text-xs text-zinc-500">Ricevi promemoria automatici</p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              disabled={!permissionGranted}
            />
          </div>

          {/* Days Before */}
          <div className="space-y-2">
            <Label htmlFor="days-before">Giorni di preavviso</Label>
            <Input
              id="days-before"
              type="number"
              min="1"
              max="30"
              value={settings.daysBeforeReminder}
              onChange={(e) => setSettings({ ...settings, daysBeforeReminder: parseInt(e.target.value) || 7 })}
              disabled={!permissionGranted || !settings.enabled}
            />
            <p className="text-xs text-zinc-500">
              Riceverai un promemoria quando mancano questo numero di giorni alla scadenza
            </p>
          </div>

          {/* Test Button */}
          <Button 
            variant="outline" 
            onClick={handleTestNotification}
            disabled={!permissionGranted}
            className="w-full"
          >
            Invia notifica di test
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Sidebar Component
const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const settings = getNotificationSettings();
    setNotificationsEnabled(settings.enabled && areNotificationsEnabled());
  }, [notificationDialogOpen]);
  
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", section: "main" },
    { to: "/calendario", icon: Calendar, label: "Calendario", section: "main" },
    { to: "/lista", icon: List, label: "Scadenziario", section: "main" },
    { to: "/nuova", icon: Plus, label: "Nuova Scadenza", section: "main" },
    { type: "divider", label: "Facility Management" },
    { to: "/facility", icon: ClipboardList, label: "Facility", section: "facility" },
    { to: "/facility/nuova", icon: Plus, label: "Nuova Attività", section: "facility" },
  ];

  const handleBackupImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = importBackup(e.target.result);
      if (result.success) {
        toast.success("Backup importato", { description: result.message });
        window.location.reload();
      } else {
        toast.error("Errore importazione", { description: result.message });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
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
              <span className="font-semibold text-zinc-900 font-['Manrope']">Gestionale</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center mx-auto">
              <Wrench className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {navItems.map((item, index) => {
            if (item.type === "divider") {
              return !collapsed ? (
                <div key={index} className="pt-4 pb-2">
                  <p className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              ) : (
                <div key={index} className="py-2">
                  <div className="border-t border-zinc-200 mx-2" />
                </div>
              );
            }
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/" || item.to === "/facility"}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
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
            );
          })}
        </nav>

        {/* Actions */}
        <div className="absolute bottom-24 left-0 right-0 p-3 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBackupImport}
            accept=".json"
            className="hidden"
          />
          
          {/* Notification Settings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationDialogOpen(true)}
            className={`w-full ${collapsed ? 'px-0' : ''}`}
            data-testid="notification-settings-btn"
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 text-emerald-600" />
            ) : (
              <BellOff className="w-4 h-4 text-zinc-400" />
            )}
            {!collapsed && <span className="ml-2">Notifiche</span>}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              exportBackup();
              toast.success("Backup esportato", { description: "File JSON scaricato" });
            }}
            className={`w-full ${collapsed ? 'px-0' : ''}`}
            data-testid="export-backup-btn"
          >
            <FileDown className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Esporta Backup</span>}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full ${collapsed ? 'px-0' : ''}`}
            data-testid="import-backup-btn"
          >
            <FileUp className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Importa Backup</span>}
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

      <NotificationSettingsDialog 
        open={notificationDialogOpen} 
        onOpenChange={setNotificationDialogOpen} 
      />
    </>
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
            Gestione Scadenziario & Facility
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

    // Check for reminders on app load
    const settings = getNotificationSettings();
    if (settings.enabled && areNotificationsEnabled()) {
      // Delay to avoid blocking initial render
      setTimeout(() => {
        const reminders = checkAndSendReminders();
        if (reminders.length > 0) {
          // Show toast summary
          const urgentCount = reminders.filter(r => r.urgent).length;
          if (urgentCount > 0) {
            toast.warning(`${urgentCount} scadenze in ritardo!`, {
              description: "Controlla le notifiche per i dettagli"
            });
          }
        }
      }, 2000);

      // Set up periodic check (every hour)
      const interval = setInterval(() => {
        sendPendingReminders();
      }, settings.checkInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <MainLayout>
        <Routes>
          {/* Maintenance Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/lista" element={<MaintenanceList />} />
          <Route path="/nuova" element={<MaintenanceForm />} />
          <Route path="/modifica/:id" element={<MaintenanceForm />} />
          
          {/* Facility Routes */}
          <Route path="/facility" element={<FacilityList />} />
          <Route path="/facility/nuova" element={<FacilityForm />} />
          <Route path="/facility/modifica/:id" element={<FacilityForm />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
