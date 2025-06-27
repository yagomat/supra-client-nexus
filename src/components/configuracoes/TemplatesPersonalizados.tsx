
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, MessageCircle, Info } from "lucide-react";
import { useTemplatesPersonalizados } from "@/hooks/useTemplatesPersonalizados";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const placeholders = [
  { placeholder: '{nome}', descricao: 'Nome do cliente' },
  { placeholder: '{dias_vencimento}', descricao: 'Dias para vencer ou em atraso' },
  { placeholder: '{data_vencimento}', descricao: 'Data de vencimento (dd/mm/aaaa)' },
  { placeholder: '{valor_plano}', descricao: 'Valor do plano (R$ 00,00)' }
];

export const TemplatesPersonalizados = () => {
  const { templates, loading, submitting, addTemplate, deleteTemplate } = useTemplatesPersonalizados();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nomeTemplate, setNomeTemplate] = useState("");
  const [mensagemTemplate, setMensagemTemplate] = useState("");

  const templatesPersonalizados = templates.filter(t => !t.is_template_padrao);
  const templatesPadrao = templates.filter(t => t.is_template_padrao);

  const handleCreateTemplate = async () => {
    if (!nomeTemplate.trim() || !mensagemTemplate.trim()) {
      return;
    }

    await addTemplate(nomeTemplate.trim(), mensagemTemplate.trim());
    setNomeTemplate("");
    setMensagemTemplate("");
    setIsDialogOpen(false);
  };

  const handleDeleteTemplate = async (templateId: string, nomeTemplate: string) => {
    await deleteTemplate(templateId, nomeTemplate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Templates de Mensagens</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie templates padrão e crie templates personalizados para suas mensagens.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Template Personalizado</DialogTitle>
              <DialogDescription>
                Crie um novo template de mensagem que poderá ser usado na fila de cobrança.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome-template">Nome do Template</Label>
                <Input
                  id="nome-template"
                  placeholder="Ex: Lembrete Amigável"
                  value={nomeTemplate}
                  onChange={(e) => setNomeTemplate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mensagem-template">Mensagem</Label>
                <Textarea
                  id="mensagem-template"
                  placeholder="Digite a mensagem do template..."
                  value={mensagemTemplate}
                  onChange={(e) => setMensagemTemplate(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Placeholders disponíveis:</p>
                    <div className="grid grid-cols-1 gap-1 text-sm">
                      {placeholders.map((item) => (
                        <div key={item.placeholder} className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {item.placeholder}
                          </code>
                          <span className="text-muted-foreground">{item.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={submitting || !nomeTemplate.trim() || !mensagemTemplate.trim()}
              >
                Criar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Padrão */}
      <div className="space-y-4">
        <h4 className="font-medium text-muted-foreground">Templates Padrão</h4>
        <div className="grid gap-4">
          {templatesPadrao.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{template.nome_template}</CardTitle>
                <CardDescription>Template do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{template.mensagem}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Templates Personalizados */}
      <div className="space-y-4">
        <h4 className="font-medium text-muted-foreground">Templates Personalizados</h4>
        {templatesPersonalizados.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum template personalizado criado</p>
                <p className="text-sm">Clique em "Novo Template" para criar seu primeiro template.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {templatesPersonalizados.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{template.nome_template}</CardTitle>
                      <CardDescription>Template personalizado</CardDescription>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={submitting}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o template "{template.nome_template}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTemplate(template.id, template.nome_template)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{template.mensagem}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
