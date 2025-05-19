import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getValoresPredefinidos, updateValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";
import { Loader2, Plus, Trash2, Save, Download, Upload } from "lucide-react";

const BancoDados = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [activeTab, setActiveTab] = useState("ufs");
  const [newValue, setNewValue] = useState("");
  const [newNumericValue, setNewNumericValue] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{ type: string; value: string | number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchValoresPredefinidos = async () => {
      try {
        setLoading(true);
        const data = await getValoresPredefinidos();
        setValoresPredefinidos(data);
      } catch (error) {
        console.error("Erro ao buscar valores predefinidos", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os valores predefinidos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchValoresPredefinidos();
  }, [toast]);

  const handleAddValue = async () => {
    if (!valoresPredefinidos) return;
    
    try {
      setSaving(true);
      
      const isNumeric = ["dias_vencimento", "valores_plano"].includes(activeTab);
      let updatedValues: string[] | number[] = [];
      
      if (isNumeric) {
        if (!newNumericValue.trim()) {
          toast({
            title: "Valor inválido",
            description: "Por favor, informe um valor válido.",
            variant: "destructive",
          });
          return;
        }
        
        const numValue = parseFloat(newNumericValue);
        if (isNaN(numValue)) {
          toast({
            title: "Valor inválido",
            description: "Por favor, informe um valor numérico válido.",
            variant: "destructive",
          });
          return;
        }
        
        updatedValues = [...valoresPredefinidos[activeTab as keyof ValoresPredefinidos] as number[], numValue];
        if (activeTab === "dias_vencimento") {
          updatedValues = (updatedValues as number[]).map(v => Math.round(v)); // Garantir que dias de vencimento sejam inteiros
        }
      } else {
        if (!newValue.trim()) {
          toast({
            title: "Valor inválido",
            description: "Por favor, informe um valor válido.",
            variant: "destructive",
          });
          return;
        }
        
        updatedValues = [...valoresPredefinidos[activeTab as keyof ValoresPredefinidos] as string[], newValue];
      }
      
      // Remover duplicatas
      updatedValues = isNumeric
        ? Array.from(new Set(updatedValues as number[]))
        : Array.from(new Set(updatedValues as string[]));
      
      // Ordenar valores
      updatedValues = isNumeric
        ? (updatedValues as number[]).sort((a, b) => a - b)
        : (updatedValues as string[]).sort();
      
      // Atualizar no backend
      await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, updatedValues);
      
      // Atualizar estado local
      setValoresPredefinidos({
        ...valoresPredefinidos,
        [activeTab]: updatedValues,
      });
      
      // Limpar inputs
      setNewValue("");
      setNewNumericValue("");
      
      // Fechar diálogo
      setIsAddDialogOpen(false);
      
      toast({
        title: "Valor adicionado",
        description: "O valor foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao adicionar valor", error);
      toast({
        title: "Erro ao adicionar valor",
        description: "Ocorreu um erro ao adicionar o valor. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteValue = async () => {
    if (!valoresPredefinidos || !itemToDelete) return;
    
    try {
      setSaving(true);
      
      const { type, value } = itemToDelete;
      const isNumeric = ["dias_vencimento", "valores_plano"].includes(type);
      
      let updatedValues: string[] | number[] = isNumeric
        ? (valoresPredefinidos[type as keyof ValoresPredefinidos] as number[]).filter((item) => item !== value)
        : (valoresPredefinidos[type as keyof ValoresPredefinidos] as string[]).filter((item) => item !== value);
      
      // Atualizar no backend
      await updateValoresPredefinidos(type as keyof ValoresPredefinidos, updatedValues);
      
      // Atualizar estado local
      setValoresPredefinidos({
        ...valoresPredefinidos,
        [type]: updatedValues,
      });
      
      toast({
        title: "Valor excluído",
        description: "O valor foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir valor", error);
      toast({
        title: "Erro ao excluir valor",
        description: "Ocorreu um erro ao excluir o valor. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setItemToDelete(null);
    }
  };

  const handleImport = async () => {
    try {
      setSaving(true);
      
      let values: string[] | number[] = [];
      const isNumeric = ["dias_vencimento", "valores_plano"].includes(activeTab);
      
      // Processar texto importado
      const items = importText.split("\n").map((item) => item.trim()).filter((item) => item.length > 0);
      
      if (isNumeric) {
        values = items.map((item) => {
          const num = parseFloat(item);
          if (isNaN(num)) {
            throw new Error(`Valor inválido: ${item}`);
          }
          return activeTab === "dias_vencimento" ? Math.round(num) : num;
        });
      } else {
        values = items;
      }
      
      // Remover duplicatas
      values = isNumeric
        ? Array.from(new Set(values as number[]))
        : Array.from(new Set(values as string[]));
      
      // Ordenar valores
      values = isNumeric
        ? (values as number[]).sort((a, b) => a - b)
        : (values as string[]).sort();
      
      // Atualizar no backend
      await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, values);
      
      // Atualizar estado local
      setValoresPredefinidos({
        ...valoresPredefinidos!,
        [activeTab]: values,
      });
      
      // Fechar diálogo e limpar input
      setIsImportDialogOpen(false);
      setImportText("");
      
      toast({
        title: "Importação concluída",
        description: `Foram importados ${values.length} valores com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao importar valores", error);
      toast({
        title: "Erro ao importar valores",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao importar os valores. Verifique se o formato está correto.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!valoresPredefinidos) return;
    
    const values = valoresPredefinidos[activeTab as keyof ValoresPredefinidos];
    const content = values.join("\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação concluída",
      description: `Os valores foram exportados com sucesso.`,
    });
  };

  const renderValues = (type: keyof ValoresPredefinidos) => {
    if (!valoresPredefinidos) return null;
    
    const values = valoresPredefinidos[type];
    const isNumeric = ["dias_vencimento", "valores_plano"].includes(type);
    
    return (
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Nenhum valor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              values.map((value, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {isNumeric && type === "valores_plano" ? `R$ ${(value as number).toFixed(2)}` : value}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete({ type, value })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banco de Dados</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os valores predefinidos utilizados no sistema.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Carregando...</span>
          </div>
        ) : valoresPredefinidos ? (
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle>Valores Predefinidos</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="ufs"
                value={activeTab}
                onValueChange={setActiveTab}
                className="pt-4"
              >
                <TabsList className="grid grid-cols-3 md:grid-cols-6">
                  <TabsTrigger value="ufs">UF</TabsTrigger>
                  <TabsTrigger value="servidores">Servidores</TabsTrigger>
                  <TabsTrigger value="dias_vencimento">Vencimentos</TabsTrigger>
                  <TabsTrigger value="valores_plano">Plano</TabsTrigger>
                  <TabsTrigger value="dispositivos_smart">Dispositivos</TabsTrigger>
                  <TabsTrigger value="aplicativos">Aplicativos</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <TabsContent value="ufs">{renderValues("ufs")}</TabsContent>
                  <TabsContent value="servidores">{renderValues("servidores")}</TabsContent>
                  <TabsContent value="dias_vencimento">{renderValues("dias_vencimento")}</TabsContent>
                  <TabsContent value="valores_plano">{renderValues("valores_plano")}</TabsContent>
                  <TabsContent value="dispositivos_smart">{renderValues("dispositivos_smart")}</TabsContent>
                  <TabsContent value="aplicativos">{renderValues("aplicativos")}</TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Diálogo para adicionar valor */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Valor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {["dias_vencimento", "valores_plano"].includes(activeTab) ? (
              <div className="space-y-2">
                <label htmlFor="newNumericValue" className="text-sm font-medium">
                  {activeTab === "dias_vencimento" ? "Dia de Vencimento" : "Valor do Plano"}
                </label>
                <Input
                  id="newNumericValue"
                  type="number"
                  step={activeTab === "valores_plano" ? "0.01" : "1"}
                  min="0"
                  value={newNumericValue}
                  onChange={(e) => setNewNumericValue(e.target.value)}
                  placeholder={activeTab === "dias_vencimento" ? "Ex: 10" : "Ex: 49.90"}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="newValue" className="text-sm font-medium">
                  {activeTab === "ufs"
                    ? "UF"
                    : activeTab === "servidores"
                    ? "Servidor"
                    : activeTab === "dispositivos_smart"
                    ? "Dispositivo Smart"
                    : "Aplicativo"}
                </label>
                <Input
                  id="newValue"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Digite o valor"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddValue}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para importar valores */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Valores</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="importText" className="text-sm font-medium">
                Cole os valores abaixo (um por linha)
              </label>
              <textarea
                id="importText"
                className="w-full min-h-[200px] p-2 border rounded-md"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Valor 1&#10;Valor 2&#10;Valor 3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este valor? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteValue}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default BancoDados;
