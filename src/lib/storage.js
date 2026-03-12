// localStorage utility for offline maintenance data management

const STORAGE_KEY = 'maintenance_scheduler_data';
const SETTINGS_KEY = 'maintenance_scheduler_settings';

// Default sample data based on the Excel structure
const defaultData = [
  {
    id: '1',
    oggetto: 'Registrazioni carico/scarico rifiuti',
    descrizione: 'Compilazione registro carico e scarico rifiuti',
    categoria: 'rifiuti',
    legge: 'D.Lgs 152/2006',
    periodicita: 'continua',
    scadenza: new Date(2025, 2, 31).toISOString(),
    stato: 'C',
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
    scadenza: new Date(2025, 3, 30).toISOString(),
    stato: 'IP',
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
    scadenza: new Date(2025, 5, 30).toISOString(),
    stato: 'C',
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
    scadenza: new Date(2025, 1, 15).toISOString(),
    stato: 'RA',
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
    scadenza: new Date(2025, 8, 30).toISOString(),
    stato: 'C',
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
    scadenza: new Date(2025, 10, 15).toISOString(),
    stato: 'C',
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
    scadenza: new Date(2025, 0, 31).toISOString(),
    stato: 'NC',
    responsabile: 'Ditta Spurgo',
    note: 'Da programmare urgentemente'
  },
  {
    id: '8',
    oggetto: 'Prova evacuazione',
    descrizione: 'Simulazione evacuazione annuale',
    categoria: 'sicurezza',
    legge: 'D.Lgs 81/2008',
    periodicita: 'annuale',
    scadenza: new Date(2025, 4, 15).toISOString(),
    stato: 'IP',
    responsabile: 'RSPP',
    note: 'Coinvolgere tutto il personale'
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

// Status configuration
export const STATUSES = [
  { value: 'C', label: 'Conforme', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'RA', label: 'Ritardo Amministrativo', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'IP', label: 'In Predisposizione', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'NC', label: 'Non Conforme', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'NA', label: 'Non Applicabile', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
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
  { value: 'quinquennale', label: 'Quinquennale' },
  { value: 'decennale', label: 'Decennale' },
  { value: 'occasionale', label: 'Occasionale' }
];

// Initialize storage with default data if empty
export const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
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
    return scadenza < now && item.stato !== 'C' && item.stato !== 'NA';
  }).sort((a, b) => new Date(a.scadenza) - new Date(b.scadenza));
};

// Get statistics
export const getStatistics = () => {
  const items = getMaintenanceItems();
  const now = new Date();
  const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const stats = {
    total: items.length,
    conforme: items.filter(i => i.stato === 'C').length,
    nonConforme: items.filter(i => i.stato === 'NC').length,
    inPredisposizione: items.filter(i => i.stato === 'IP').length,
    ritardo: items.filter(i => i.stato === 'RA').length,
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
    }).length,
    scadute: items.filter(i => {
      const d = new Date(i.scadenza);
      return d < now && i.stato !== 'C' && i.stato !== 'NA';
    }).length
  };
  
  return stats;
};

// Export to CSV
export const exportToCSV = () => {
  const items = getMaintenanceItems();
  const headers = ['ID', 'Oggetto', 'Descrizione', 'Categoria', 'Legge/Norma', 'Periodicità', 'Scadenza', 'Stato', 'Responsabile', 'Note'];
  
  const categoryLabels = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));
  const statusLabels = Object.fromEntries(STATUSES.map(s => [s.value, s.label]));
  const periodicityLabels = Object.fromEntries(PERIODICITIES.map(p => [p.value, p.label]));
  
  const rows = items.map(item => [
    item.id,
    `"${item.oggetto || ''}"`,
    `"${item.descrizione || ''}"`,
    categoryLabels[item.categoria] || item.categoria,
    `"${item.legge || ''}"`,
    periodicityLabels[item.periodicita] || item.periodicita,
    new Date(item.scadenza).toLocaleDateString('it-IT'),
    statusLabels[item.stato] || item.stato,
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

// Import from JSON (for backup/restore)
export const importData = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (Array.isArray(data)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
};

// Clear all data
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  return true;
};

// Get category color
export const getCategoryColor = (category) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.color : 'bg-zinc-100 text-zinc-800 border-zinc-200';
};

// Get status color
export const getStatusColor = (status) => {
  const st = STATUSES.find(s => s.value === status);
  return st ? st.color : 'bg-zinc-100 text-zinc-600 border-zinc-200';
};

// Get status label
export const getStatusLabel = (status) => {
  const st = STATUSES.find(s => s.value === status);
  return st ? st.label : status;
};

// Get category label
export const getCategoryLabel = (category) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.label : category;
};
