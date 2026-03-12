import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  getMaintenanceItems, 
  deleteMaintenanceItem,
  getCategoryColor,
  getStatusColor,
  getCategoryLabel,
  getStatusLabel,
  CATEGORIES,
  STATUSES
} from "@/lib/storage";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

const MaintenanceList = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'scadenza', direction: 'asc' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(getMaintenanceItems());
  };

  const handleDelete = (id) => {
    deleteMaintenanceItem(id);
    loadItems();
    toast.success("Manutenzione eliminata");
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.oggetto?.toLowerCase().includes(query) ||
        item.descrizione?.toLowerCase().includes(query) ||
        item.responsabile?.toLowerCase().includes(query) ||
        item.legge?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter(item => item.categoria === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(item => item.stato === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'scadenza') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchQuery, categoryFilter, statusFilter, sortConfig]);

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || statusFilter !== "all";

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1" />
      : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="space-y-6" data-testid="maintenance-list-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-['Manrope']">Elenco Manutenzioni</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {filteredAndSortedItems.length} di {items.length} elementi
          </p>
        </div>
        <Link to="/nuova">
          <Button data-testid="new-maintenance-btn">
            <Plus className="w-4 h-4 mr-2" />
            Nuova Manutenzione
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card data-testid="filters-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Cerca per oggetto, descrizione, responsabile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="search-input"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="category-filter">
                <Filter className="w-4 h-4 mr-2 text-zinc-400" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="status-filter">
                <Filter className="w-4 h-4 mr-2 text-zinc-400" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {STATUSES.map(st => (
                  <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-zinc-500" data-testid="clear-filters-btn">
                <X className="w-4 h-4 mr-1" />
                Pulisci
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card data-testid="data-table-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="data-table">
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('oggetto')}
                    data-testid="sort-oggetto"
                  >
                    <div className="flex items-center">
                      Oggetto
                      <SortIcon columnKey="oggetto" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('categoria')}
                    data-testid="sort-categoria"
                  >
                    <div className="flex items-center">
                      Categoria
                      <SortIcon columnKey="categoria" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('scadenza')}
                    data-testid="sort-scadenza"
                  >
                    <div className="flex items-center">
                      Scadenza
                      <SortIcon columnKey="scadenza" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('stato')}
                    data-testid="sort-stato"
                  >
                    <div className="flex items-center">
                      Stato
                      <SortIcon columnKey="stato" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-100 transition-colors"
                    onClick={() => handleSort('responsabile')}
                    data-testid="sort-responsabile"
                  >
                    <div className="flex items-center">
                      Responsabile
                      <SortIcon columnKey="responsabile" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-sm text-zinc-500">Nessun elemento trovato</p>
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
                  filteredAndSortedItems.map((item) => {
                    const scadenza = new Date(item.scadenza);
                    const daysUntil = differenceInDays(scadenza, new Date());
                    const isOverdue = daysUntil < 0 && item.stato !== 'C' && item.stato !== 'NA';

                    return (
                      <TableRow 
                        key={item.id} 
                        className={`hover:bg-zinc-50 ${isOverdue ? 'bg-red-50/50' : ''}`}
                        data-testid={`row-${item.id}`}
                      >
                        <TableCell className="font-medium max-w-[250px]">
                          <div>
                            <p className="truncate" title={item.oggetto}>{item.oggetto}</p>
                            {item.legge && (
                              <p className="text-xs text-zinc-500 truncate">{item.legge}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getCategoryColor(item.categoria)} whitespace-nowrap`}>
                            {getCategoryLabel(item.categoria)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                              {format(scadenza, 'dd/MM/yyyy')}
                            </p>
                            <p className={`text-xs ${isOverdue ? 'text-red-500' : 'text-zinc-500'}`}>
                              {isOverdue 
                                ? `Scaduto da ${Math.abs(daysUntil)} gg`
                                : daysUntil === 0 
                                  ? 'Oggi'
                                  : `Tra ${daysUntil} gg`
                              }
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(item.stato)}>
                            {getStatusLabel(item.stato)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <p className="truncate text-sm" title={item.responsabile}>
                            {item.responsabile}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/modifica/${item.id}`}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                data-testid={`edit-${item.id}`}
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
                                  data-testid={`delete-${item.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sei sicuro di voler eliminare "{item.oggetto}"? 
                                    Questa azione non può essere annullata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    data-testid={`confirm-delete-${item.id}`}
                                  >
                                    Elimina
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceList;
