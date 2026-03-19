import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  getFacilityItems, 
  deleteFacilityItem,
  getFacilityPriorityColor,
  getFacilityPriorityLabel,
  getFacilityStatusColor,
  getFacilityStatusLabel,
  FACILITY_PRIORITIES,
  FACILITY_STATUSES,
  exportFacilityToCSV,
  exportFacilityToExcel,
  exportFacilityToPDF,
  importFacilityFromExcel
} from "@/lib/storage";
import { format } from "date-fns";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const FacilityList = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'dataInserimento', direction: 'desc' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(getFacilityItems());
  };

  const handleDelete = (id) => {
    deleteFacilityItem(id);
    loadItems();
    toast.success("Attività eliminata");
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const handleExportExcel = async () => {
    try {
      await exportFacilityToExcel();
      toast.success("Export Excel completato");
    } catch (err) {
      toast.error("Errore export Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportFacilityToPDF();
      toast.success("Export PDF completato");
    } catch (err) {
      toast.error("Errore export PDF");
    }
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await importFacilityFromExcel(file);
      toast.success(result.message);
      loadItems();
    } catch (err) {
      toast.error(err.message || "Errore importazione Excel");
    }
    event.target.value = '';
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.id?.toLowerCase().includes(query) ||
        item.oggetto?.toLowerCase().includes(query) ||
        item.descrizione?.toLowerCase().includes(query) ||
        item.richiedente?.toLowerCase().includes(query) ||
        item.assegnatario?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(item => item.stato === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter(item => item.priorita === priorityFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'dataInserimento' || sortConfig.key === 'scadenza' || sortConfig.key === 'dataChiusura') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchQuery, statusFilter, priorityFilter, sortConfig]);

  const hasActiveFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all";

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1" />
      : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="space-y-6" data-testid="facility-list-page">
      {/* Hidden file input for Excel import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportExcel}
        accept=".xlsx,.xls"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-['Manrope']">Facility Management</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {filteredAndSortedItems.length} di {items.length} attività
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" data-testid="facility-export-dropdown-btn">
                <Download className="w-4 h-4 mr-2" />
                Esporta
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Formato export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportExcel} data-testid="facility-export-excel-btn">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { exportFacilityToCSV(); toast.success("Export CSV completato"); }} data-testid="facility-export-csv-btn">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} data-testid="facility-export-pdf-btn">
                <FileText className="w-4 h-4 mr-2 text-red-600" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import Button */}
          <Button 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            data-testid="facility-import-excel-btn"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importa Excel
          </Button>

          <Link to="/facility/nuova">
            <Button data-testid="new-facility-btn">
              <Plus className="w-4 h-4 mr-2" />
              Nuova Attività
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card data-testid="facility-filters-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Cerca per ID, oggetto, richiedente, assegnatario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="facility-search-input"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="facility-status-filter">
                <Filter className="w-4 h-4 mr-2 text-zinc-400" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {FACILITY_STATUSES.map(st => (
                  <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]" data-testid="facility-priority-filter">
                <Filter className="w-4 h-4 mr-2 text-zinc-400" />
                <SelectValue placeholder="Priorità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                {FACILITY_PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-zinc-500" data-testid="facility-clear-filters-btn">
                <X className="w-4 h-4 mr-1" />
                Pulisci
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card data-testid="facility-data-table-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="data-table">
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors w-20"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      ID
                      <SortIcon columnKey="id" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('dataInserimento')}
                  >
                    <div className="flex items-center">
                      Data
                      <SortIcon columnKey="dataInserimento" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('oggetto')}
                  >
                    <div className="flex items-center">
                      Oggetto
                      <SortIcon columnKey="oggetto" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('priorita')}
                  >
                    <div className="flex items-center">
                      Priorità
                      <SortIcon columnKey="priorita" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('stato')}
                  >
                    <div className="flex items-center">
                      Stato
                      <SortIcon columnKey="stato" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('assegnatario')}
                  >
                    <div className="flex items-center">
                      Assegnatario
                      <SortIcon columnKey="assegnatario" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <p className="text-sm text-zinc-500">Nessuna attività trovata</p>
                      {hasActiveFilters && (
                        <Button 
                          variant="link" 
                          onClick={clearFilters}
                          className="mt-2"
                        >
                          Rimuovi filtri
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedItems.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className={`hover:bg-zinc-50 ${
                        item.priorita === 'urgente' && item.stato !== 'completato' ? 'bg-red-50/30' : ''
                      }`}
                      data-testid={`facility-row-${item.id}`}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {item.id}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(item.dataInserimento), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div>
                          <p className="truncate font-medium" title={item.oggetto}>{item.oggetto}</p>
                          <p className="text-xs text-zinc-500 truncate">{item.richiedente}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getFacilityPriorityColor(item.priorita)}>
                          {getFacilityPriorityLabel(item.priorita)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getFacilityStatusColor(item.stato)}>
                          {item.stato === 'completato' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {getFacilityStatusLabel(item.stato)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[120px]">
                        <p className="truncate text-sm" title={item.assegnatario}>
                          {item.assegnatario || '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/facility/modifica/${item.id}`}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              data-testid={`facility-edit-${item.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                data-testid={`facility-delete-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sei sicuro di voler eliminare l'attività "{item.id} - {item.oggetto}"? 
                                  Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  data-testid={`facility-confirm-delete-${item.id}`}
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacilityList;
