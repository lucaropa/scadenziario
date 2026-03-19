// localStorage utility for offline maintenance and facility data management

const STORAGE_KEY = 'maintenance_scheduler_data';
const FACILITY_KEY = 'facility_management_data';
const SETTINGS_KEY = 'maintenance_scheduler_settings';

// Default sample data based on the Excel structure
const defaultMaintenanceData = [
  {
    id: '1',
    oggetto: 'Registrazioni carico/scarico rifiuti',
    descrizione: 'Compilazione registro carico e scarico rifiuti',
    categoria: 'rifiuti',
    legge: 'D.Lgs 152/2006',
    periodicita: 'continua',
    scadenza: new Date(2026, 5, 31).toISOString(),
    responsabile: 'Ufficio Ambiente',
    note: 'Registro cartaceo e digitale'
  },
  {
    id: '2',
    oggetto: 'MUD - Dichiarazione Ambientale',
    descrizione: 'Presentazione MUD annuale',
    categoria: 'rifiuti',
    legge: 'L. 70/1994',
    periodicita: 'annuale',
    scadenza: new Date(2026, 3, 30).toISOString(),
    responsabile: 'Consulente Esterno',
    note: 'Scadenza 30 aprile ogni anno'
  },
  {
    id: '3',
    oggetto: 'Analisi emissioni in atmosfera',
    descrizione: 'Verifica emissioni camini',
    categoria: 'emissioni',
    legge: 'D.Lgs 152/2006 Parte V',
    periodicita: 'annuale',
    scadenza: new Date(2026, 5, 30).toISOString(),
    responsabile: 'Laboratorio Esterno',
    note: 'Analisi annuale obbligatoria'
  },
  {
    id: '4',
    oggetto: 'Manutenzione estintori',
    descrizione: 'Controllo semestrale estintori',
    categoria: 'antincendio',
    legge: 'DM 10/03/1998',
    periodicita: 'semestrale',
    scadenza: new Date(2026, 3, 15).toISOString(),
    responsabile: 'Ditta Antincendio',
    note: 'Controllo semestrale + revisione annuale'
  },
  {
    id: '5',
    oggetto: 'Verifica impianto messa a terra',
    descrizione: 'Verifica biennale impianto di terra',
    categoria: 'sicurezza',
    legge: 'DPR 462/2001',
    periodicita: 'biennale',
    scadenza: new Date(2026, 8, 30).toISOString(),
    responsabile: 'ASL/Organismo Abilitato',
    note: 'Verifica obbligatoria biennale'
  },
  {
    id: '6',
    oggetto: 'Manutenzione caldaia',
    descrizione: 'Controllo efficienza energetica caldaia',
    categoria: 'manutenzione',
    legge: 'DPR 74/2013',
    periodicita: 'annuale',
    scadenza: new Date(2026, 10, 15).toISOString(),
    responsabile: 'Tecnico Termico',
    note: 'Libretto impianto obbligatorio'
  },
  {
    id: '7',
    oggetto: 'Pulizia degrassatore',
    descrizione: 'Svuotamento e pulizia degrassatore acque',
    categoria: 'scarichi',
    legge: 'D.Lgs 152/2006',
    periodicita: 'semestrale',
    scadenza: new Date(2026, 2, 20).toISOString(),
    responsabile: 'Ditta Spurgo',
    note: 'Da programmare'
  },
  {
    id: '8',
    oggetto: 'Prova evacuazione',
    descrizione: 'Simulazione evacuazione annuale',
    categoria: 'sicurezza',
    legge: 'D.Lgs 81/2008',
    periodicita: 'annuale',
    scadenza: new Date(2026, 4, 15).toISOString(),
    responsabile: 'RSPP',
    note: 'Coinvolgere tutto il personale'
  }
];

// Default sample facility data
const defaultFacilityData = [
  {
    id: 'F001',
    dataInserimento: new Date(2026, 2, 1).toISOString(),
    richiedente: 'Mario Rossi',
    oggetto: 'Riparazione climatizzatore ufficio 3',
    descrizione: 'Il climatizzatore non raffredda correttamente',
    priorita: 'alta',
    stato: 'in_corso',
    assegnatario: 'Tecnico HVAC',
    tipoAttivita: 'manutenzione_correttiva',
    note: 'Richiesto intervento urgente',
    scadenza: new Date(2026, 2, 15).toISOString(),
    dataChiusura: null
  },
  {
    id: 'F002',
    dataInserimento: new Date(2026, 2, 5).toISOString(),
    richiedente: 'Anna Bianchi',
    oggetto: 'Sostituzione lampadine corridoio B',
    descrizione: 'Diverse lampadine fulminate nel corridoio B piano 2',
    priorita: 'media',
    stato: 'aperto',
    assegnatario: 'Elettricista',
    tipoAttivita: 'manutenzione_ordinaria',
    note: '',
    scadenza: new Date(2026, 2, 20).toISOString(),
    dataChiusura: null
  }
];

// Categories configuration
export const CATEGORIES = [
  { value: 'rifiuti', label: 'Rifiuti', color: 'bg-stone-100 text-stone-800 border-stone-200' },
  { value: 'emissioni', label: 'Emissioni', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { value: 'scarichi', label: 'Scarichi', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'antincendio', label: 'Antincendio', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'sicurezza', label: 'Sicurezza', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'manutenzione', label: 'Manutenzione Impianti', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
];

// AUTOMATIC Status based on deadline - NO MANUAL STATUS ANYMORE
export const AUTO_STATUSES = [
  { value: 'conforme', label: 'Conforme', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'prossima_scadenza', label: 'Prossima Scadenza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'ritardo', label: 'In Ritardo', color: 'bg-red-100 text-red-800 border-red-200' }
];

// Periodicity options
export const PERIODICITIES = [
  { value: 'continua', label: 'Continua' },
  { value: 'settimanale', label: 'Settimanale' },
  { value: 'mensile', label: 'Mensile' },
  { value: 'trimestrale', label: 'Trimestrale' },
  { value: 'semestrale', label: 'Semestrale' },
  { value: 'annuale', label: 'Annuale' },
  { value: 'biennale', label: 'Biennale' },
  { value: 'triennale', label: 'Triennale' },
  { value: 'quadriennale', label: 'Quadriennale' },
  { value: 'quinquennale', label: 'Quinquennale' },
  { value: 'decennale', label: 'Decennale' },
  { value: 'quindicennale', label: 'Quindicennale' },
  { value: 'occasionale', label: 'Occasionale' }
];

// Facility Management - Priority
export const FACILITY_PRIORITIES = [
  { value: 'bassa', label: 'Bassa', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'media', label: 'Media', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-700 border-red-200' }
];

// Facility Management - Status
export const FACILITY_STATUSES = [
  { value: 'aperto', label: 'Aperto', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'in_corso', label: 'In Corso', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'in_attesa', label: 'In Attesa', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'completato', label: 'Completato', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'annullato', label: 'Annullato', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
];

// Facility Management - Activity Types
export const FACILITY_ACTIVITY_TYPES = [
  { value: 'manutenzione_ordinaria', label: 'Manutenzione Ordinaria' },
  { value: 'manutenzione_correttiva', label: 'Manutenzione Correttiva' },
  { value: 'manutenzione_straordinaria', label: 'Manutenzione Straordinaria' },
  { value: 'richiesta_materiale', label: 'Richiesta Materiale' },
  { value: 'spostamento_arredi', label: 'Spostamento Arredi' },
  { value: 'pulizie_straordinarie', label: 'Pulizie Straordinarie' },
  { value: 'intervento_elettrico', label: 'Intervento Elettrico' },
  { value: 'intervento_idraulico', label: 'Intervento Idraulico' },
  { value: 'intervento_hvac', label: 'Intervento HVAC' },
  { value: 'sicurezza', label: 'Sicurezza' },
  { value: 'altro', label: 'Altro' }
];

// =====================
// AUTOMATIC STATUS CALCULATION
// =====================
export const calculateAutoStatus = (scadenza) => {
  const now = new Date();
  const deadline = new Date(scadenza);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'ritardo'; // Past deadline = RED
  } else if (diffDays <= 21) {
    return 'prossima_scadenza'; // Within 3 weeks = YELLOW/ORANGE
  } else {
    return 'conforme'; // More than 3 weeks = GREEN
  }
};

export const getAutoStatusColor = (scadenza) => {
  const status = calculateAutoStatus(scadenza);
  const st = AUTO_STATUSES.find(s => s.value === status);
  return st ? st.color : 'bg-zinc-100 text-zinc-600 border-zinc-200';
};

export const getAutoStatusLabel = (scadenza) => {
  const status = calculateAutoStatus(scadenza);
  const st = AUTO_STATUSES.find(s => s.value === status);
  return st ? st.label : status;
};

// =====================
// MAINTENANCE FUNCTIONS
// =====================

// Initialize storage with default data if empty
export const initializeStorage = () => {
  const existingMaintenance = localStorage.getItem(STORAGE_KEY);
  if (!existingMaintenance) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMaintenanceData));
  }
  
  const existingFacility = localStorage.getItem(FACILITY_KEY);
  if (!existingFacility) {
    localStorage.setItem(FACILITY_KEY, JSON.stringify(defaultFacilityData));
  }
  
  return getMaintenanceItems();
};

// Get all maintenance items
export const getMaintenanceItems = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Get a single maintenance item by ID
export const getMaintenanceById = (id) => {
  const items = getMaintenanceItems();
  return items.find(item => item.id === id);
};

// Add a new maintenance item
export const addMaintenanceItem = (item) => {
  const items = getMaintenanceItems();
  const newItem = {
    ...item,
    id: Date.now().toString()
  };
  items.push(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
};

// Update an existing maintenance item
export const updateMaintenanceItem = (id, updates) => {
  const items = getMaintenanceItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items[index];
  }
  return null;
};

// Delete a maintenance item
export const deleteMaintenanceItem = (id) => {
  const items = getMaintenanceItems();
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Get items expiring soon (within days)
export const getExpiringItems = (days = 30) => {
  const items = getMaintenanceItems();
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return items.filter(item => {
    const scadenza = new Date(item.scadenza);
    return scadenza >= now && scadenza <= futureDate;
  }).sort((a, b) => new Date(a.scadenza) - new Date(b.scadenza));
};

// Get overdue items
export const getOverdueItems = () => {
  const items = getMaintenanceItems();
  const now = new Date();
  
  return items.filter(item => {
    const scadenza = new Date(item.scadenza);
    return scadenza < now;
  }).sort((a, b) => new Date(a.scadenza) - new Date(b.scadenza));
};

// Get statistics for maintenance
export const getStatistics = () => {
  const items = getMaintenanceItems();
  const now = new Date();
  const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const threeWeeks = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
  
  const stats = {
    total: items.length,
    conforme: items.filter(i => calculateAutoStatus(i.scadenza) === 'conforme').length,
    prossimaScadenza: items.filter(i => calculateAutoStatus(i.scadenza) === 'prossima_scadenza').length,
    ritardo: items.filter(i => calculateAutoStatus(i.scadenza) === 'ritardo').length,
    scaduteOggi: items.filter(i => {
      const d = new Date(i.scadenza);
      return d.toDateString() === now.toDateString();
    }).length,
    scaduteSettimana: items.filter(i => {
      const d = new Date(i.scadenza);
      return d >= now && d <= thisWeek;
    }).length,
    scaduteMese: items.filter(i => {
      const d = new Date(i.scadenza);
      return d >= now && d <= thisMonth;
    }).length
  };
  
  return stats;
};

// =====================
// FACILITY FUNCTIONS
// =====================

// Get all facility items
export const getFacilityItems = () => {
  const data = localStorage.getItem(FACILITY_KEY);
  return data ? JSON.parse(data) : [];
};

// Get a single facility item by ID
export const getFacilityById = (id) => {
  const items = getFacilityItems();
  return items.find(item => item.id === id);
};

// Generate next facility ID
export const generateFacilityId = () => {
  const items = getFacilityItems();
  const lastId = items.length > 0 
    ? Math.max(...items.map(i => parseInt(i.id.replace('F', '')) || 0))
    : 0;
  return `F${String(lastId + 1).padStart(3, '0')}`;
};

// Add a new facility item
export const addFacilityItem = (item) => {
  const items = getFacilityItems();
  const newItem = {
    ...item,
    id: generateFacilityId(),
    dataInserimento: new Date().toISOString()
  };
  items.push(newItem);
  localStorage.setItem(FACILITY_KEY, JSON.stringify(items));
  return newItem;
};

// Update an existing facility item
export const updateFacilityItem = (id, updates) => {
  const items = getFacilityItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(FACILITY_KEY, JSON.stringify(items));
    return items[index];
  }
  return null;
};

// Delete a facility item
export const deleteFacilityItem = (id) => {
  const items = getFacilityItems();
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(FACILITY_KEY, JSON.stringify(filtered));
  return true;
};

// Get facility statistics
export const getFacilityStatistics = () => {
  const items = getFacilityItems();
  
  return {
    total: items.length,
    aperto: items.filter(i => i.stato === 'aperto').length,
    inCorso: items.filter(i => i.stato === 'in_corso').length,
    inAttesa: items.filter(i => i.stato === 'in_attesa').length,
    completato: items.filter(i => i.stato === 'completato').length,
    urgenti: items.filter(i => i.priorita === 'urgente' && i.stato !== 'completato').length
  };
};

// =====================
// EXPORT FUNCTIONS
// =====================

// Export maintenance to CSV
export const exportToCSV = () => {
  const items = getMaintenanceItems();
  const headers = ['ID', 'Oggetto', 'Descrizione', 'Categoria', 'Legge/Norma', 'Periodicità', 'Scadenza', 'Stato', 'Responsabile', 'Note'];
  
  const categoryLabels = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));
  const periodicityLabels = Object.fromEntries(PERIODICITIES.map(p => [p.value, p.label]));
  
  const rows = items.map(item => [
    item.id,
    `"${item.oggetto || ''}"`,
    `"${item.descrizione || ''}"`,
    categoryLabels[item.categoria] || item.categoria,
    `"${item.legge || ''}"`,
    periodicityLabels[item.periodicita] || item.periodicita,
    new Date(item.scadenza).toLocaleDateString('it-IT'),
    getAutoStatusLabel(item.scadenza),
    `"${item.responsabile || ''}"`,
    `"${item.note || ''}"`
  ]);
  
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scadenziario_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export facility to CSV
export const exportFacilityToCSV = () => {
  const items = getFacilityItems();
  const headers = ['ID', 'Data Inserimento', 'Richiedente', 'Oggetto', 'Descrizione', 'Priorità', 'Stato', 'Assegnatario', 'Tipo Attività', 'Note', 'Scadenza', 'Data Chiusura'];
  
  const priorityLabels = Object.fromEntries(FACILITY_PRIORITIES.map(p => [p.value, p.label]));
  const statusLabels = Object.fromEntries(FACILITY_STATUSES.map(s => [s.value, s.label]));
  const activityLabels = Object.fromEntries(FACILITY_ACTIVITY_TYPES.map(a => [a.value, a.label]));
  
  const rows = items.map(item => [
    item.id,
    new Date(item.dataInserimento).toLocaleDateString('it-IT'),
    `"${item.richiedente || ''}"`,
    `"${item.oggetto || ''}"`,
    `"${item.descrizione || ''}"`,
    priorityLabels[item.priorita] || item.priorita,
    statusLabels[item.stato] || item.stato,
    `"${item.assegnatario || ''}"`,
    activityLabels[item.tipoAttivita] || item.tipoAttivita,
    `"${item.note || ''}"`,
    item.scadenza ? new Date(item.scadenza).toLocaleDateString('it-IT') : '',
    item.dataChiusura ? new Date(item.dataChiusura).toLocaleDateString('it-IT') : ''
  ]);
  
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `facility_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// =====================
// BACKUP / RESTORE FUNCTIONS
// =====================

// Export ALL data as JSON backup
export const exportBackup = () => {
  const backup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    maintenance: getMaintenanceItems(),
    facility: getFacilityItems()
  };
  
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  return true;
};

// Import backup from JSON file
export const importBackup = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // Validate backup structure
    if (!data.maintenance && !data.facility) {
      // Try legacy format (array only = maintenance)
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return { success: true, message: 'Backup manutenzioni importato con successo' };
      }
      return { success: false, message: 'Formato backup non valido' };
    }
    
    // Import maintenance data
    if (data.maintenance && Array.isArray(data.maintenance)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.maintenance));
    }
    
    // Import facility data
    if (data.facility && Array.isArray(data.facility)) {
      localStorage.setItem(FACILITY_KEY, JSON.stringify(data.facility));
    }
    
    return { 
      success: true, 
      message: `Backup importato: ${data.maintenance?.length || 0} manutenzioni, ${data.facility?.length || 0} attività facility`
    };
  } catch (e) {
    console.error('Import failed:', e);
    return { success: false, message: 'Errore durante l\'importazione: ' + e.message };
  }
};

// Clear all data
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FACILITY_KEY);
  return true;
};

// =====================
// HELPER FUNCTIONS
// =====================

// Get category color
export const getCategoryColor = (category) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.color : 'bg-zinc-100 text-zinc-800 border-zinc-200';
};

// Get category label
export const getCategoryLabel = (category) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.label : category;
};

// Get facility priority color
export const getFacilityPriorityColor = (priority) => {
  const p = FACILITY_PRIORITIES.find(pr => pr.value === priority);
  return p ? p.color : 'bg-zinc-100 text-zinc-600 border-zinc-200';
};

// Get facility priority label
export const getFacilityPriorityLabel = (priority) => {
  const p = FACILITY_PRIORITIES.find(pr => pr.value === priority);
  return p ? p.label : priority;
};

// Get facility status color
export const getFacilityStatusColor = (status) => {
  const s = FACILITY_STATUSES.find(st => st.value === status);
  return s ? s.color : 'bg-zinc-100 text-zinc-600 border-zinc-200';
};

// Get facility status label
export const getFacilityStatusLabel = (status) => {
  const s = FACILITY_STATUSES.find(st => st.value === status);
  return s ? s.label : status;
};

// Get facility activity type label
export const getFacilityActivityLabel = (type) => {
  const a = FACILITY_ACTIVITY_TYPES.find(at => at.value === type);
  return a ? a.label : type;
};

// =====================
// EXCEL EXPORT/IMPORT FUNCTIONS
// =====================

// Export maintenance to Excel
export const exportMaintenanceToExcel = async () => {
  const XLSX = (await import('xlsx')).default;
  const items = getMaintenanceItems();
  
  const categoryLabels = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));
  const periodicityLabels = Object.fromEntries(PERIODICITIES.map(p => [p.value, p.label]));
  
  const data = items.map(item => ({
    'ID': item.id,
    'Oggetto': item.oggetto || '',
    'Descrizione': item.descrizione || '',
    'Categoria': categoryLabels[item.categoria] || item.categoria,
    'Legge/Norma': item.legge || '',
    'Periodicità': periodicityLabels[item.periodicita] || item.periodicita,
    'Scadenza': new Date(item.scadenza).toLocaleDateString('it-IT'),
    'Stato': getAutoStatusLabel(item.scadenza),
    'Responsabile': item.responsabile || '',
    'Note': item.note || ''
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Scadenziario');
  
  // Auto-size columns
  const colWidths = [
    { wch: 10 }, { wch: 35 }, { wch: 40 }, { wch: 20 }, 
    { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, 
    { wch: 25 }, { wch: 30 }
  ];
  ws['!cols'] = colWidths;
  
  XLSX.writeFile(wb, `scadenziario_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export facility to Excel
export const exportFacilityToExcel = async () => {
  const XLSX = (await import('xlsx')).default;
  const items = getFacilityItems();
  
  const priorityLabels = Object.fromEntries(FACILITY_PRIORITIES.map(p => [p.value, p.label]));
  const statusLabels = Object.fromEntries(FACILITY_STATUSES.map(s => [s.value, s.label]));
  const activityLabels = Object.fromEntries(FACILITY_ACTIVITY_TYPES.map(a => [a.value, a.label]));
  
  const data = items.map(item => ({
    'ID': item.id,
    'Data Inserimento': new Date(item.dataInserimento).toLocaleDateString('it-IT'),
    'Richiedente': item.richiedente || '',
    'Oggetto': item.oggetto || '',
    'Descrizione': item.descrizione || '',
    'Priorità': priorityLabels[item.priorita] || item.priorita,
    'Stato': statusLabels[item.stato] || item.stato,
    'Assegnatario': item.assegnatario || '',
    'Tipo Attività': activityLabels[item.tipoAttivita] || item.tipoAttivita,
    'Note': item.note || '',
    'Scadenza': item.scadenza ? new Date(item.scadenza).toLocaleDateString('it-IT') : '',
    'Data Chiusura': item.dataChiusura ? new Date(item.dataChiusura).toLocaleDateString('it-IT') : ''
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Facility');
  
  // Auto-size columns
  const colWidths = [
    { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 35 }, 
    { wch: 40 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, 
    { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 }
  ];
  ws['!cols'] = colWidths;
  
  XLSX.writeFile(wb, `facility_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Import maintenance from Excel
export const importMaintenanceFromExcel = async (file) => {
  const XLSX = (await import('xlsx')).default;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel columns to our data structure
        const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.label.toLowerCase(), c.value]));
        const periodicityMap = Object.fromEntries(PERIODICITIES.map(p => [p.label.toLowerCase(), p.value]));
        
        const items = jsonData.map((row, index) => {
          // Parse date from various formats
          let scadenza = new Date();
          const dateField = row['Scadenza'] || row['scadenza'] || row['DATA SCADENZA'];
          if (dateField) {
            if (typeof dateField === 'number') {
              // Excel date serial number
              scadenza = new Date((dateField - 25569) * 86400 * 1000);
            } else if (typeof dateField === 'string') {
              // Try parsing DD/MM/YYYY format
              const parts = dateField.split('/');
              if (parts.length === 3) {
                scadenza = new Date(parts[2], parts[1] - 1, parts[0]);
              } else {
                scadenza = new Date(dateField);
              }
            }
          }
          
          const categoriaRaw = (row['Categoria'] || row['categoria'] || row['CATEGORIA'] || '').toLowerCase();
          const periodicitaRaw = (row['Periodicità'] || row['periodicita'] || row['PERIODICITA'] || '').toLowerCase();
          
          return {
            id: row['ID'] || row['id'] || Date.now().toString() + index,
            oggetto: row['Oggetto'] || row['oggetto'] || row['OGGETTO'] || '',
            descrizione: row['Descrizione'] || row['descrizione'] || row['DESCRIZIONE'] || '',
            categoria: categoryMap[categoriaRaw] || categoriaRaw || 'manutenzione',
            legge: row['Legge/Norma'] || row['legge'] || row['LEGGE'] || row['Norma'] || '',
            periodicita: periodicityMap[periodicitaRaw] || periodicitaRaw || 'annuale',
            scadenza: scadenza.toISOString(),
            responsabile: row['Responsabile'] || row['responsabile'] || row['RESPONSABILE'] || '',
            note: row['Note'] || row['note'] || row['NOTE'] || ''
          };
        });
        
        // Get existing items and merge
        const existing = getMaintenanceItems();
        const merged = [...existing, ...items];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        
        resolve({ success: true, message: `Importate ${items.length} manutenzioni da Excel` });
      } catch (err) {
        reject({ success: false, message: 'Errore lettura file Excel: ' + err.message });
      }
    };
    reader.onerror = () => reject({ success: false, message: 'Errore lettura file' });
    reader.readAsArrayBuffer(file);
  });
};

// Import facility from Excel
export const importFacilityFromExcel = async (file) => {
  const XLSX = (await import('xlsx')).default;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const priorityMap = Object.fromEntries(FACILITY_PRIORITIES.map(p => [p.label.toLowerCase(), p.value]));
        const statusMap = Object.fromEntries(FACILITY_STATUSES.map(s => [s.label.toLowerCase(), s.value]));
        const activityMap = Object.fromEntries(FACILITY_ACTIVITY_TYPES.map(a => [a.label.toLowerCase(), a.value]));
        
        const items = jsonData.map((row, index) => {
          const parseDate = (field) => {
            if (!field) return null;
            if (typeof field === 'number') {
              return new Date((field - 25569) * 86400 * 1000).toISOString();
            }
            const parts = field.split('/');
            if (parts.length === 3) {
              return new Date(parts[2], parts[1] - 1, parts[0]).toISOString();
            }
            return new Date(field).toISOString();
          };
          
          return {
            id: row['ID'] || generateFacilityId(),
            dataInserimento: parseDate(row['Data Inserimento']) || new Date().toISOString(),
            richiedente: row['Richiedente'] || row['richiedente'] || '',
            oggetto: row['Oggetto'] || row['oggetto'] || '',
            descrizione: row['Descrizione'] || row['descrizione'] || '',
            priorita: priorityMap[(row['Priorità'] || row['priorita'] || '').toLowerCase()] || 'media',
            stato: statusMap[(row['Stato'] || row['stato'] || '').toLowerCase()] || 'aperto',
            assegnatario: row['Assegnatario'] || row['assegnatario'] || '',
            tipoAttivita: activityMap[(row['Tipo Attività'] || row['tipoAttivita'] || '').toLowerCase()] || 'altro',
            note: row['Note'] || row['note'] || '',
            scadenza: parseDate(row['Scadenza']),
            dataChiusura: parseDate(row['Data Chiusura'])
          };
        });
        
        const existing = getFacilityItems();
        const merged = [...existing, ...items];
        localStorage.setItem(FACILITY_KEY, JSON.stringify(merged));
        
        resolve({ success: true, message: `Importate ${items.length} attività facility da Excel` });
      } catch (err) {
        reject({ success: false, message: 'Errore lettura file Excel: ' + err.message });
      }
    };
    reader.onerror = () => reject({ success: false, message: 'Errore lettura file' });
    reader.readAsArrayBuffer(file);
  });
};

// =====================
// PDF EXPORT FUNCTIONS
// =====================

// Export maintenance to PDF
export const exportMaintenanceToPDF = async () => {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  
  const items = getMaintenanceItems();
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  
  const categoryLabels = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));
  const periodicityLabels = Object.fromEntries(PERIODICITIES.map(p => [p.value, p.label]));
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SCADENZIARIO MANUTENZIONI', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report generato il ${new Date().toLocaleDateString('it-IT')}`, 14, 22);
  
  // Statistics summary
  const stats = getStatistics();
  doc.setFontSize(9);
  doc.text(`Totale: ${stats.total} | Conformi: ${stats.conforme} | Prossima Scadenza: ${stats.prossimaScadenza} | In Ritardo: ${stats.ritardo}`, 14, 28);
  
  // Table data
  const tableData = items.map(item => [
    item.oggetto?.substring(0, 30) || '',
    categoryLabels[item.categoria] || item.categoria,
    item.legge?.substring(0, 20) || '',
    periodicityLabels[item.periodicita] || item.periodicita,
    new Date(item.scadenza).toLocaleDateString('it-IT'),
    getAutoStatusLabel(item.scadenza),
    item.responsabile?.substring(0, 20) || ''
  ]);
  
  doc.autoTable({
    startY: 33,
    head: [['Oggetto', 'Categoria', 'Legge', 'Periodicità', 'Scadenza', 'Stato', 'Responsabile']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [24, 24, 27], 
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
      6: { cellWidth: 35 }
    },
    didParseCell: function(data) {
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.raw;
        if (status === 'In Ritardo') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Prossima Scadenza') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Conforme') {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Pagina ${i} di ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`scadenziario_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export facility to PDF
export const exportFacilityToPDF = async () => {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  
  const items = getFacilityItems();
  const doc = new jsPDF('l', 'mm', 'a4');
  
  const priorityLabels = Object.fromEntries(FACILITY_PRIORITIES.map(p => [p.value, p.label]));
  const statusLabels = Object.fromEntries(FACILITY_STATUSES.map(s => [s.value, s.label]));
  const activityLabels = Object.fromEntries(FACILITY_ACTIVITY_TYPES.map(a => [a.value, a.label]));
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACILITY MANAGEMENT - REGISTRO ATTIVITÀ', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report generato il ${new Date().toLocaleDateString('it-IT')}`, 14, 22);
  
  // Statistics summary
  const stats = getFacilityStatistics();
  doc.setFontSize(9);
  doc.text(`Totale: ${stats.total} | Aperte: ${stats.aperto} | In Corso: ${stats.inCorso} | Completate: ${stats.completato} | Urgenti: ${stats.urgenti}`, 14, 28);
  
  // Table data
  const tableData = items.map(item => [
    item.id,
    new Date(item.dataInserimento).toLocaleDateString('it-IT'),
    item.richiedente?.substring(0, 15) || '',
    item.oggetto?.substring(0, 35) || '',
    priorityLabels[item.priorita] || item.priorita,
    statusLabels[item.stato] || item.stato,
    item.assegnatario?.substring(0, 15) || '',
    item.scadenza ? new Date(item.scadenza).toLocaleDateString('it-IT') : '-'
  ]);
  
  doc.autoTable({
    startY: 33,
    head: [['ID', 'Data', 'Richiedente', 'Oggetto', 'Priorità', 'Stato', 'Assegnatario', 'Scadenza']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [24, 24, 27], 
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 22 },
      2: { cellWidth: 30 },
      3: { cellWidth: 70 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 },
      7: { cellWidth: 22 }
    },
    didParseCell: function(data) {
      if (data.column.index === 4 && data.section === 'body') {
        const priority = data.cell.raw;
        if (priority === 'Urgente') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (priority === 'Alta') {
          data.cell.styles.textColor = [234, 88, 12];
        }
      }
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.raw;
        if (status === 'Completato') {
          data.cell.styles.textColor = [22, 163, 74];
        } else if (status === 'In Corso') {
          data.cell.styles.textColor = [217, 119, 6];
        }
      }
    }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Pagina ${i} di ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`facility_${new Date().toISOString().split('T')[0]}.pdf`);
};

// =====================
// NOTIFICATION FUNCTIONS
// =====================

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { success: false, message: 'Browser non supporta le notifiche' };
  }
  
  const permission = await Notification.requestPermission();
  return { 
    success: permission === 'granted', 
    message: permission === 'granted' ? 'Notifiche abilitate' : 'Notifiche non autorizzate'
  };
};

// Check if notifications are enabled
export const areNotificationsEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

// Get notification settings from localStorage
export const getNotificationSettings = () => {
  const settings = localStorage.getItem(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : { 
    enabled: false, 
    daysBeforeReminder: 7,
    checkInterval: 60 // minutes
  };
};

// Save notification settings
export const saveNotificationSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Show notification
export const showNotification = (title, body, tag) => {
  if (!areNotificationsEnabled()) return;
  
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    tag,
    requireInteraction: true
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

// Check and send reminders for upcoming deadlines
export const checkAndSendReminders = () => {
  if (!areNotificationsEnabled()) return [];
  
  const settings = getNotificationSettings();
  if (!settings.enabled) return [];
  
  const reminders = [];
  const now = new Date();
  const reminderDate = new Date(now.getTime() + settings.daysBeforeReminder * 24 * 60 * 60 * 1000);
  
  // Check maintenance items
  const maintenanceItems = getMaintenanceItems();
  maintenanceItems.forEach(item => {
    const scadenza = new Date(item.scadenza);
    const status = calculateAutoStatus(item.scadenza);
    
    if (status === 'ritardo') {
      reminders.push({
        type: 'maintenance',
        id: item.id,
        title: 'SCADENZA IN RITARDO',
        body: `"${item.oggetto}" è scaduto il ${scadenza.toLocaleDateString('it-IT')}`,
        urgent: true
      });
    } else if (scadenza <= reminderDate && scadenza >= now) {
      const daysUntil = Math.ceil((scadenza - now) / (1000 * 60 * 60 * 24));
      reminders.push({
        type: 'maintenance',
        id: item.id,
        title: 'Promemoria Scadenza',
        body: `"${item.oggetto}" scade tra ${daysUntil} giorni (${scadenza.toLocaleDateString('it-IT')})`,
        urgent: false
      });
    }
  });
  
  // Check facility items with deadlines
  const facilityItems = getFacilityItems();
  facilityItems.forEach(item => {
    if (!item.scadenza || item.stato === 'completato' || item.stato === 'annullato') return;
    
    const scadenza = new Date(item.scadenza);
    if (scadenza < now) {
      reminders.push({
        type: 'facility',
        id: item.id,
        title: 'ATTIVITÀ FACILITY SCADUTA',
        body: `"${item.oggetto}" (${item.id}) doveva essere completata il ${scadenza.toLocaleDateString('it-IT')}`,
        urgent: true
      });
    } else if (scadenza <= reminderDate) {
      const daysUntil = Math.ceil((scadenza - now) / (1000 * 60 * 60 * 24));
      reminders.push({
        type: 'facility',
        id: item.id,
        title: 'Promemoria Attività Facility',
        body: `"${item.oggetto}" (${item.id}) scade tra ${daysUntil} giorni`,
        urgent: false
      });
    }
  });
  
  return reminders;
};

// Send all pending reminders as notifications
export const sendPendingReminders = () => {
  const reminders = checkAndSendReminders();
  
  reminders.forEach((reminder, index) => {
    // Stagger notifications to avoid spam
    setTimeout(() => {
      showNotification(
        reminder.title,
        reminder.body,
        `${reminder.type}-${reminder.id}`
      );
    }, index * 1000);
  });
  
  return reminders.length;
};
