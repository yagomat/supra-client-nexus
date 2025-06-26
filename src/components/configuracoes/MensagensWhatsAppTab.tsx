
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, MessageCircle, Save } from "lucide-react";
import { useMensagensWhatsApp } from "@/hooks/useMensagensWhatsApp";
import { TipoMensagem } from "@/services/mensagensWhatsAppService";

const tiposMensagem: Array<{
  tipo: TipoMensagem;
  titulo: string;
  descricao: string;
}> = [
  {
    tipo: 'a_vencer',
    titulo: 'A Vencer',
    descricao: 'Mensagem para clientes que ainda não venceram'
  },
  {
    tipo: 'vence_hoje',
    titulo: 'Vence Hoje',
    descricao: 'Mensagem para clientes que vencem hoje'
  },
  {
    tipo: 'vencido',
    titulo: 'Vencido',
    descricao: 'Mensagem para clientes em atraso'
  },
  {
    tipo: 'pago',
    titulo: 'Pago',
    descricao: 'Mensagem de confirmação de pagamento'
  }
];

const placeholders = [
  { placeholder: '{nome}', descricao: 'Nome do cliente' },
  { placeholder: '{dias_vencimento}', descricao: 'Dias para vencer ou em atraso' },
  { placeholder: '{data_vencimento}', descricao: 'Data de vencimento (dd/mm/aaaa)' },
  { placeholder: '{valor_plano}', descricao: 'Valor do plano (R$ 00,00)' }
];

export const MensagensWhatsAppTab = () => {
  const { mensagens, loading, submitting, updateMensagem } = useMensagensWhatsApp();
  const [mensagensEditadas, setMensagensEditadas] = useState<Record<TipoMensagem, string>>({
    a_vencer: '',
    vence_hoje: '',
    vencido: '',
    pago: ''
  });

  // Sincronizar mensagens carregadas com as editadas
  React.useEffect(() => {
    if (!loading) {
      setMensagensEditadas(mensagens);
    }
  }, [mensagens, loading]);

  const handleMensagemChange = (tipo: TipoMensagem, valor: string) => {
    setMensagensEditadas(prev => ({
      ...prev,
      [tipo]: valor
    }));
  };

  const handleSalvarMensagem = async (tipo: TipoMensagem) => {
    await updateMensagem(tipo, mensagensEditadas[tipo]);
  };

  const handleSalvarTodas = async () => {
    for (const tipo of Object.keys(mensagensEditadas) as TipoMensagem[]) {
      if (mensagensEditadas[tipo] !== mensagens[tipo]) {
        await updateMensagem(tipo, mensagensEditadas[tipo]);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Mensagens do WhatsApp</h3>
        <p className="text-sm text-muted-foreground">
          Configure as mensagens que serão enviadas via WhatsApp para seus clientes.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Placeholders disponíveis:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
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

      <div className="grid gap-6">
        {tiposMensagem.map((config) => (
          <Card key={config.tipo}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {config.titulo}
                <Button
                  size="sm"
                  onClick={() => handleSalvarMensagem(config.tipo)}
                  disabled={submitting || mensagensEditadas[config.tipo] === mensagens[config.tipo]}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </CardTitle>
              <CardDescription>{config.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={`mensagem-${config.tipo}`}>Mensagem</Label>
                <Textarea
                  id={`mensagem-${config.tipo}`}
                  value={mensagensEditadas[config.tipo]}
                  onChange={(e) => handleMensagemChange(config.tipo, e.target.value)}
                  placeholder={`Digite a mensagem para "${config.titulo.toLowerCase()}"`}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSalvarTodas}
          disabled={submitting}
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Todas as Mensagens
        </Button>
      </div>
    </div>
  );
};
