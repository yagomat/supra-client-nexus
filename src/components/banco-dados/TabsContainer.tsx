
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ValueManagerToolbar } from "@/components/banco-dados/ValueManagerToolbar";
import { ValuesTable } from "@/components/banco-dados/ValuesTable";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Upload, Download, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Valor {
  id: string;
  valor: string;
  descricao?: string;
}

const formSchema = z.object({
  valor: z.string().min(2, {
    message: "O valor deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().optional(),
})

export function TabsContainer() {
  const [valores, setValores] = useState<{ [tipo: string]: Valor[] }>({
    aplicativos: [],
    servidores: [],
    ufs: [],
    usuarios: [],
    senhas: [],
    dispositivos: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valor: "",
      descricao: "",
    },
  })

  const getValoresForTipo = (tipo: string): Valor[] => {
    return valores[tipo] || [];
  };

  const handleAddValue = (tipo: string) => {
    setSelectedTipo(tipo);
    setIsAddModalOpen(true);
    form.reset();
  };

  const handleCreateValue = async (values: z.infer<typeof formSchema>) => {
    if (!selectedTipo) return;

    setIsLoading(true);
    try {
      const novoValor = {
        id: crypto.randomUUID(),
        valor: values.valor,
        descricao: values.descricao,
      };

      setValores(prevValores => ({
        ...prevValores,
        [selectedTipo]: [...(prevValores[selectedTipo] || []), novoValor],
      }));

      toast({
        title: "Sucesso!",
        description: `Valor "${values.valor}" adicionado em ${getTipoDisplayName(selectedTipo)}.`,
      });
      setIsAddModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível adicionar o valor. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteValue = async (tipo: string, id: string) => {
    setIsLoading(true);
    try {
      setValores(prevValores => ({
        ...prevValores,
        [tipo]: (prevValores[tipo] || []).filter(valor => valor.id !== id),
      }));

      toast({
        title: "Sucesso!",
        description: `Valor removido de ${getTipoDisplayName(tipo)}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível remover o valor. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async (tipo: string) => {
    setIsLoading(true);
    try {
      setValores(prevValores => ({
        ...prevValores,
        [tipo]: [],
      }));

      toast({
        title: "Sucesso!",
        description: `Todos os valores removidos de ${getTipoDisplayName(tipo)}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível remover todos os valores. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (tipo: string) => {
    // Implementar a lógica de importação aqui
    toast({
      title: "Em breve!",
      description: `Importação de valores para ${getTipoDisplayName(tipo)} será implementada em breve.`,
    });
  };

  const handleExport = async (tipo: string) => {
    // Implementar a lógica de exportação aqui
    toast({
      title: "Em breve!",
      description: `Exportação de valores para ${getTipoDisplayName(tipo)} será implementada em breve.`,
    });
  };

  return (
    <div className="section-spacing">
      <div className="section-header">
        <h2 className="section-title">
          Gerenciar Valores Predefinidos
        </h2>
        <p className="section-description">
          Cadastre e gerencie os valores que aparecem nas listas dos formulários
        </p>
      </div>

      <Tabs defaultValue="aplicativos" className="component-spacing">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="aplicativos">Aplicativos</TabsTrigger>
          <TabsTrigger value="servidores">Servidores</TabsTrigger>
          <TabsTrigger value="ufs">UFs</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="senhas">Senhas</TabsTrigger>
          <TabsTrigger value="dispositivos">Dispositivos</TabsTrigger>
        </TabsList>

        {(['aplicativos', 'servidores', 'ufs', 'usuarios', 'senhas', 'dispositivos'] as const).map((tipo) => (
          <TabsContent key={tipo} value={tipo} className="component-spacing">
            <Card className="card-standard">
              <CardHeader className="card-header">
                <CardTitle className="card-title">
                  {getTipoDisplayName(tipo)}
                </CardTitle>
                <CardDescription className="card-description">
                  Gerencie os valores para {getTipoDisplayName(tipo).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content component-spacing">
                <ValueManagerToolbar
                  tipo={tipo}
                  onAdd={handleAddValue}
                  onImport={handleImport}
                  onExport={handleExport}
                  onDeleteAll={() => handleDeleteAll(tipo)}
                  isLoading={isLoading}
                  hasValues={getValoresForTipo(tipo).length > 0}
                />
                
                <ValuesTable
                  values={getValoresForTipo(tipo).map(v => v.valor)}
                  type={tipo}
                  onDelete={(type: string, value: string | number) => {
                    const valorObj = getValoresForTipo(type).find(v => v.valor === value);
                    if (valorObj) {
                      handleDeleteValue(type, valorObj.id);
                    }
                  }}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar {selectedTipo ? getTipoDisplayName(selectedTipo) : ''}</DialogTitle>
            <DialogDescription>
              Adicione um novo valor à lista de {selectedTipo ? getTipoDisplayName(selectedTipo).toLowerCase() : ''}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateValue)} className="space-y-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Google Chrome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Uma breve descrição sobre o valor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLoading}>
              Cancelar
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getTipoDisplayName(tipo: string): string {
  switch (tipo) {
    case 'aplicativos':
      return 'Aplicativo';
    case 'servidores':
      return 'Servidor';
    case 'ufs':
      return 'UF';
    case 'usuarios':
      return 'Usuário';
    case 'senhas':
      return 'Senha';
    case 'dispositivos':
      return 'Dispositivo';
    default:
      return 'Valor';
  }
}
