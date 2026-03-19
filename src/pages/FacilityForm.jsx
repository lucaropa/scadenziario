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
  getFacilityById, 
  addFacilityItem, 
  updateFacilityItem,
  FACILITY_PRIORITIES,
  FACILITY_STATUSES,
  FACILITY_ACTIVITY_TYPES
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

const FacilityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    richiedente: "",
    oggetto: "",
    descrizione: "",
    priorita: "media",
    stato: "aperto",
    assegnatario: "",
    tipoAttivita: "",
    note: "",
    scadenza: null,
    dataChiusura: null
  });
  const [scadenzaCalendarOpen, setScadenzaCalendarOpen] = useState(false);
  const [chiusuraCalendarOpen, setChiusuraCalendarOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const item = getFacilityById(id);
      if (item) {
        setFormData({
          ...item,
          scadenza: item.scadenza ? new Date(item.scadenza) : null,
          dataChiusura: item.dataChiusura ? new Date(item.dataChiusura) : null
        });
      } else {
        toast.error("Attività non trovata");
        navigate("/facility");
      }
    }
  }, [id, isEditing, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.richiedente.trim()) {
      toast.error("Inserisci il richiedente");
      return;
    }
    if (!formData.oggetto.trim()) {
      toast.error("Inserisci l'oggetto dell'attività");
      return;
    }
    if (!formData.tipoAttivita) {
      toast.error("Seleziona il tipo di attività");
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        scadenza: formData.scadenza ? formData.scadenza.toISOString() : null,
        dataChiusura: formData.dataChiusura ? formData.dataChiusura.toISOString() : null
      };

      if (isEditing) {
        updateFacilityItem(id, dataToSave);
        toast.success("Attività aggiornata", {
          description: `${id} - ${formData.oggetto}`
        });
      } else {
        const newItem = addFacilityItem(dataToSave);
        toast.success("Attività creata", {
          description: `${newItem.id} - ${formData.oggetto}`
        });
      }

      navigate("/facility");
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="facility-form-page">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link to="/facility">
          <Button variant="ghost" size="icon" data-testid="facility-back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-['Manrope']">
            {isEditing ? `Modifica Attività ${id}` : "Nuova Attività Facility"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isEditing ? "Modifica i dati dell'attività" : "Inserisci i dati della nuova richiesta"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl space-y-6">
          {/* Dati Richiesta */}
          <Card data-testid="facility-request-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Dati Richiesta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="richiedente">Richiedente *</Label>
                  <Input
                    id="richiedente"
                    placeholder="Nome del richiedente"
                    value={formData.richiedente}
                    onChange={(e) => handleChange('richiedente', e.target.value)}
                    data-testid="facility-input-richiedente"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo Attività *</Label>
                  <Select 
                    value={formData.tipoAttivita} 
                    onValueChange={(value) => handleChange('tipoAttivita', value)}
                  >
                    <SelectTrigger data-testid="facility-select-tipo">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_ACTIVITY_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oggetto">Oggetto *</Label>
                <Input
                  id="oggetto"
                  placeholder="es. Riparazione climatizzatore ufficio 3"
                  value={formData.oggetto}
                  onChange={(e) => handleChange('oggetto', e.target.value)}
                  data-testid="facility-input-oggetto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descrizione">Descrizione</Label>
                <Textarea
                  id="descrizione"
                  placeholder="Descrizione dettagliata della richiesta..."
                  value={formData.descrizione}
                  onChange={(e) => handleChange('descrizione', e.target.value)}
                  rows={3}
                  data-testid="facility-input-descrizione"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gestione */}
          <Card data-testid="facility-management-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Gestione Attività
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priorità *</Label>
                  <Select 
                    value={formData.priorita} 
                    onValueChange={(value) => handleChange('priorita', value)}
                  >
                    <SelectTrigger data-testid="facility-select-priorita">
                      <SelectValue placeholder="Seleziona priorità" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_PRIORITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
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
                    <SelectTrigger data-testid="facility-select-stato">
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assegnatario">Assegnatario</Label>
                <Input
                  id="assegnatario"
                  placeholder="Tecnico o ditta incaricata"
                  value={formData.assegnatario}
                  onChange={(e) => handleChange('assegnatario', e.target.value)}
                  data-testid="facility-input-assegnatario"
                />
              </div>
            </CardContent>
          </Card>

          {/* Scadenze */}
          <Card data-testid="facility-dates-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scadenza prevista</Label>
                  <Popover open={scadenzaCalendarOpen} onOpenChange={setScadenzaCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        data-testid="facility-date-scadenza-btn"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scadenza 
                          ? format(formData.scadenza, "dd MMMM yyyy", { locale: it })
                          : "Seleziona data"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.scadenza}
                        onSelect={(date) => {
                          handleChange('scadenza', date);
                          setScadenzaCalendarOpen(false);
                        }}
                        locale={it}
                        initialFocus
                      />
                      {formData.scadenza && (
                        <div className="p-2 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              handleChange('scadenza', null);
                              setScadenzaCalendarOpen(false);
                            }}
                          >
                            Rimuovi data
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data Chiusura</Label>
                  <Popover open={chiusuraCalendarOpen} onOpenChange={setChiusuraCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        data-testid="facility-date-chiusura-btn"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataChiusura 
                          ? format(formData.dataChiusura, "dd MMMM yyyy", { locale: it })
                          : "Non ancora chiusa"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dataChiusura}
                        onSelect={(date) => {
                          handleChange('dataChiusura', date);
                          if (date) {
                            handleChange('stato', 'completato');
                          }
                          setChiusuraCalendarOpen(false);
                        }}
                        locale={it}
                        initialFocus
                      />
                      {formData.dataChiusura && (
                        <div className="p-2 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              handleChange('dataChiusura', null);
                              setChiusuraCalendarOpen(false);
                            }}
                          >
                            Rimuovi data
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card data-testid="facility-notes-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-['Manrope']">
                Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="note">Note aggiuntive</Label>
                <Textarea
                  id="note"
                  placeholder="Note sull'attività, aggiornamenti, riferimenti..."
                  value={formData.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  rows={4}
                  data-testid="facility-input-note"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link to="/facility">
              <Button variant="outline" type="button" data-testid="facility-cancel-btn">
                Annulla
              </Button>
            </Link>
            <Button type="submit" disabled={loading} data-testid="facility-save-btn">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Salva Modifiche" : "Crea Attività"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FacilityForm;
