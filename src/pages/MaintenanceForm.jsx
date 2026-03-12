import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  getMaintenanceById, 
  addMaintenanceItem, 
  updateMaintenanceItem,
  CATEGORIES,
  STATUSES,
  PERIODICITIES
} from "@/lib/storage";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { 
  ArrowLeft, 
  Save, 
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const MaintenanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oggetto: "",
    descrizione: "",
    categoria: "",
    legge: "",
    periodicita: "",
    scadenza: new Date(),
    stato: "IP",
    responsabile: "",
    note: ""
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const item = getMaintenanceById(id);
      if (item) {
        setFormData({
          ...item,
          scadenza: new Date(item.scadenza)
        });
      } else {
        toast.error("Manutenzione non trovata");
        navigate("/lista");
      }
    }
  }, [id, isEditing, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.oggetto.trim()) {
      toast.error("Inserisci l'oggetto della manutenzione");
      return;
    }
    if (!formData.categoria) {
      toast.error("Seleziona una categoria");
      return;
    }
    if (!formData.periodicita) {
      toast.error("Seleziona la periodicità");
      return;
    }
    if (!formData.responsabile.trim()) {
      toast.error("Inserisci il responsabile");
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        scadenza: formData.scadenza.toISOString()
      };

      if (isEditing) {
        updateMaintenanceItem(id, dataToSave);
        toast.success("Manutenzione aggiornata", {
          description: formData.oggetto
        });
      } else {
        addMaintenanceItem(dataToSave);
        toast.success("Manutenzione creata", {
          description: formData.oggetto
        });
      }

      navigate("/lista");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="maintenance-form-page">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link to="/lista">
          <Button variant="ghost" size="icon" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-['Manrope']">
            {isEditing ? "Modifica Manutenzione" : "Nuova Manutenzione"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isEditing ? "Modifica i dati della manutenzione" : "Inserisci i dati della nuova manutenzione"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl space-y-6">
          {/* Dati Generali */}
          <Card data-testid="general-data-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Dati Generali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oggetto">Oggetto *</Label>
                <Input
                  id="oggetto"
                  placeholder="es. Manutenzione estintori"
                  value={formData.oggetto}
                  onChange={(e) => handleChange('oggetto', e.target.value)}
                  data-testid="input-oggetto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descrizione">Descrizione</Label>
                <Textarea
                  id="descrizione"
                  placeholder="Descrizione dettagliata dell'attività..."
                  value={formData.descrizione}
                  onChange={(e) => handleChange('descrizione', e.target.value)}
                  rows={3}
                  data-testid="input-descrizione"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legge">Legge/Norma di riferimento</Label>
                <Input
                  id="legge"
                  placeholder="es. D.Lgs 81/2008"
                  value={formData.legge}
                  onChange={(e) => handleChange('legge', e.target.value)}
                  data-testid="input-legge"
                />
              </div>
            </CardContent>
          </Card>

          {/* Classificazione */}
          <Card data-testid="classification-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Classificazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => handleChange('categoria', value)}
                  >
                    <SelectTrigger data-testid="select-categoria">
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stato *</Label>
                  <Select 
                    value={formData.stato} 
                    onValueChange={(value) => handleChange('stato', value)}
                  >
                    <SelectTrigger data-testid="select-stato">
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(st => (
                        <SelectItem key={st.value} value={st.value}>
                          {st.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scadenza e Periodicità */}
          <Card data-testid="schedule-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Scadenza e Periodicità
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periodicità *</Label>
                  <Select 
                    value={formData.periodicita} 
                    onValueChange={(value) => handleChange('periodicita', value)}
                  >
                    <SelectTrigger data-testid="select-periodicita">
                      <SelectValue placeholder="Seleziona periodicità" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODICITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Scadenza *</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        data-testid="date-picker-btn"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.scadenza, "dd MMMM yyyy", { locale: it })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.scadenza}
                        onSelect={(date) => {
                          if (date) {
                            handleChange('scadenza', date);
                            setCalendarOpen(false);
                          }
                        }}
                        locale={it}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsabile">Responsabile/Incaricato *</Label>
                <Input
                  id="responsabile"
                  placeholder="es. Ditta Manutenzione Srl"
                  value={formData.responsabile}
                  onChange={(e) => handleChange('responsabile', e.target.value)}
                  data-testid="input-responsabile"
                />
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card data-testid="notes-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Note e Documentazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="note">Note aggiuntive</Label>
                <Textarea
                  id="note"
                  placeholder="Note, riferimenti a documenti, istruzioni..."
                  value={formData.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  rows={4}
                  data-testid="input-note"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link to="/lista">
              <Button variant="outline" type="button" data-testid="cancel-btn">
                Annulla
              </Button>
            </Link>
            <Button type="submit" disabled={loading} data-testid="save-btn">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Salva Modifiche" : "Crea Manutenzione"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
