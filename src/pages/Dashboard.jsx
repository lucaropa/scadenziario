import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getStatistics, 
  getExpiringItems, 
  getOverdueItems,
  getCategoryColor,
  getCategoryLabel,
  getAutoStatusColor,
  getAutoStatusLabel,
  getFacilityStatistics
} from "@/lib/storage";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color, delay }) => (
  <Card 
    className={`card-hover animate-fade-in opacity-0 stagger-${delay}`}
    data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
  >
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1 font-['Manrope']">{value}</p>
          {trend && (
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Urgent Item Row
const UrgentItem = ({ item }) => {
  const scadenza = new Date(item.scadenza);
  const daysUntil = differenceInDays(scadenza, new Date());
  const isOverdue = daysUntil < 0;
  
  return (
    <div 
      className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 -mx-2 px-2 rounded transition-colors"
      data-testid={`urgent-item-${item.id}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{item.oggetto}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={`${getCategoryColor(item.categoria)} text-[10px]`}>
            {getCategoryLabel(item.categoria)}
          </Badge>
          <Badge variant="outline" className={`${getAutoStatusColor(item.scadenza)} text-[10px]`}>
            {getAutoStatusLabel(item.scadenza)}
          </Badge>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-zinc-700'}`}>
          {isOverdue ? `Scaduto da ${Math.abs(daysUntil)} gg` : 
           daysUntil === 0 ? 'Oggi' :
           daysUntil === 1 ? 'Domani' :
           `Tra ${daysUntil} gg`}
        </p>
        <p className="text-xs text-zinc-500">{format(scadenza, 'dd MMM yyyy', { locale: it })}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [facilityStats, setFacilityStats] = useState(null);
  const [urgentItems, setUrgentItems] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);

  useEffect(() => {
    const loadData = () => {
      setStats(getStatistics());
      setFacilityStats(getFacilityStatistics());
      setUrgentItems(getExpiringItems(30));
      setOverdueItems(getOverdueItems());
    };
    loadData();
    
    // Refresh data when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (!stats || !facilityStats) return null;

  // Chart data for maintenance
  const chartData = [
    { name: 'Conforme', value: stats.conforme, color: '#10b981' },
    { name: 'Prossima Scadenza', value: stats.prossimaScadenza, color: '#f59e0b' },
    { name: 'In Ritardo', value: stats.ritardo, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const conformityRate = stats.total > 0 
    ? Math.round((stats.conforme / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-['Manrope']">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Panoramica scadenziario e facility management</p>
        </div>
        <div className="flex gap-2">
          <Link to="/nuova">
            <Button data-testid="new-maintenance-btn">
              <Plus className="w-4 h-4 mr-2" />
              Nuova Scadenza
            </Button>
          </Link>
          <Link to="/facility/nuova">
            <Button variant="outline" data-testid="new-facility-btn">
              <ClipboardList className="w-4 h-4 mr-2" />
              Nuova Attività
            </Button>
          </Link>
        </div>
      </div>

      {/* Maintenance Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Scadenziario Manutenzioni</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Totale Attività" 
            value={stats.total} 
            icon={Calendar}
            color="bg-zinc-100 text-zinc-700"
            delay={1}
          />
          <StatCard 
            title="Conformi" 
            value={stats.conforme} 
            icon={CheckCircle2}
            trend={`${conformityRate}% conformità`}
            color="bg-emerald-100 text-emerald-700"
            delay={2}
          />
          <StatCard 
            title="Prossima Scadenza" 
            value={stats.prossimaScadenza} 
            icon={Clock}
            color="bg-amber-100 text-amber-700"
            delay={3}
          />
          <StatCard 
            title="In Ritardo" 
            value={stats.ritardo} 
            icon={AlertTriangle}
            color="bg-red-100 text-red-700"
            delay={4}
          />
        </div>
      </div>

      {/* Facility Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Facility Management</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="bg-blue-500 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-['Manrope']">{facilityStats.aperto}</p>
              <p className="text-xs text-blue-100 uppercase tracking-wider mt-1">Aperte</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-['Manrope']">{facilityStats.inCorso}</p>
              <p className="text-xs text-amber-100 uppercase tracking-wider mt-1">In Corso</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-['Manrope']">{facilityStats.inAttesa}</p>
              <p className="text-xs text-purple-100 uppercase tracking-wider mt-1">In Attesa</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-['Manrope']">{facilityStats.completato}</p>
              <p className="text-xs text-emerald-100 uppercase tracking-wider mt-1">Completate</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-['Manrope']">{facilityStats.urgenti}</p>
              <p className="text-xs text-red-100 uppercase tracking-wider mt-1">Urgenti</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Deadlines */}
        <Card className="lg:col-span-2 animate-fade-in opacity-0 stagger-5" data-testid="urgent-deadlines-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold font-['Manrope'] flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Scadenze Imminenti
              </CardTitle>
              <Link to="/lista" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
                Vedi tutte <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {overdueItems.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {overdueItems.length} attività in ritardo richiedono attenzione immediata
                </p>
              </div>
            )}
            <div className="space-y-0">
              {[...overdueItems, ...urgentItems].slice(0, 8).map((item) => (
                <UrgentItem key={item.id} item={item} />
              ))}
              {urgentItems.length === 0 && overdueItems.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-8">
                  Nessuna scadenza nei prossimi 30 giorni
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Chart */}
        <Card className="animate-fade-in opacity-0 stagger-5" data-testid="compliance-chart-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold font-['Manrope']">
              Stato Scadenze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} attività`, name]}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e4e4e7',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-xs text-zinc-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-zinc-900 font-['Manrope']">{conformityRate}%</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Tasso di conformità</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
