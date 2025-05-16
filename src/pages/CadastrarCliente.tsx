
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { createCliente } from "@/services/clienteService";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";
import { PlusCircle, Loader2 } from "lucide-react";

const CadastrarCliente = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [possuiTelaAdicional, setPossuiTelaAdicional] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Informações básicas
    nome: "",
    telefone: "",
    uf: "",
    servidor: "",
    dia_vencimento: "",
    valor_plano: "",
    
    // Tela principal
    dispositivo_smart: "",
    aplicativo: "",
    usuario_aplicativo: "",
    senha_aplicativo: "",
    data_licenca_aplicativo: "",
    
    // Tela adicional
    dispositivo_smart_2: "",
    aplicativo_2: "",
    usuario_2: "",
    senha_2: "",
    data_licenca_2: "",
    
    observacoes: ""
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    const requiredFields = ['nome', 'servidor', 'aplicativo', 'usuario_aplicativo', 'senha_aplicativo'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios faltando",
        description: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Formatar os dados para enviar ao servidor
      const clienteData = {
        nome: formData.nome,
        telefone: formData.telefone || null,
        uf: formData.uf || null,
        servidor: formData.servidor,
        dia_vencimento: parseInt(formData.dia_vencimento) || 1,
        valor_plano: formData.valor_plano ? parseFloat(formData.valor_plano) : null,
        
        dispositivo_smart: formData.dispositivo_smart || null,
        aplicativo: formData.aplicativo,
        usuario_aplicativo: formData.usuario_aplicativo,
        senha_aplicativo: formData.senha_aplicativo,
        data_licenca_aplicativo: formData.data_licenca_aplicativo || null,
        
        possui_tela_adicional: possuiTelaAdicional,
        dispositivo_smart_2: possuiTelaAdicional ? formData.dispositivo_smart_2 || null : null,
        aplicativo_2: possuiTelaAdicional ? formData.aplicativo_2 || null : null,
        usuario_2: possuiTelaAdicional ? formData.usuario_2 || null : null,
        senha_2: possuiTelaAdicional ? formData.senha_2 || null : null,
        data_licenca_2: possuiTelaAdicional ? formData.data_licenca_2 || null : null,
        
        observacoes: formData.observacoes || null
      };

      // Enviar dados para o backend
      await createCliente(clienteData);

      toast({
        title: "Cliente cadastrado com sucesso",
        description: `O cliente ${formData.nome} foi cadastrado com sucesso.`,
      });

      // Redirecionar para a lista de clientes
      navigate("/clientes");
    } catch (error) {
      console.error("Erro ao cadastrar cliente", error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro ao cadastrar o cliente. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Cadastrar Cliente</h1>
        <p className="text-muted-foreground">
          Preencha os campos abaixo para cadastrar um novo cliente.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Carregando...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nome" className="text-sm font-medium">
                      Nome <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Nome completo do cliente"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="telefone" className="text-sm font-medium">
                      Telefone
                    </label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="uf" className="text-sm font-medium">
                      UF
                    </label>
                    <Select
                      value={formData.uf}
                      onValueChange={(value) => handleSelectChange("uf", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {valoresPredefinidos?.ufs.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="servidor" className="text-sm font-medium">
                      Servidor <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={formData.servidor}
                      onValueChange={(value) => handleSelectChange("servidor", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o servidor" />
                      </SelectTrigger>
                      <SelectContent>
                        {valoresPredefinidos?.servidores.map((servidor) => (
                          <SelectItem key={servidor} value={servidor}>
                            {servidor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dia_vencimento" className="text-sm font-medium">
                      Dia de Vencimento
                    </label>
                    <Select
                      value={formData.dia_vencimento}
                      onValueChange={(value) => handleSelectChange("dia_vencimento", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {valoresPredefinidos?.dias_vencimento.map((dia) => (
                          <SelectItem key={dia} value={dia.toString()}>
                            {dia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="valor_plano" className="text-sm font-medium">
                      Valor do Plano
                    </label>
                    <Select
                      value={formData.valor_plano}
                      onValueChange={(value) => handleSelectChange("valor_plano", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o valor" />
                      </SelectTrigger>
                      <SelectContent>
                        {valoresPredefinidos?.valores_plano.map((valor) => (
                          <SelectItem key={valor} value={valor.toString()}>
                            R$ {valor.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tela Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="dispositivo_smart" className="text-sm font-medium">
                      Dispositivo Smart
                    </label>
                    <Select
                      value={formData.dispositivo_smart}
                      onValueChange={(value) => handleSelectChange("dispositivo_smart", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dispositivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {valoresPredefinidos?.dispositivos_smart.map((dispositivo) => (
                          <SelectItem key={dispositivo} value={dispositivo}>
                            {dispositivo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="aplicativo" className="text-sm font-medium">
                      Aplicativo <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={formData.aplicativo}
                      onValueChange={(value) => handleSelectChange("aplicativo", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aplicativo" />
                      </SelectTrigger>
                      <SelectContent>
                        {valoresPredefinidos?.aplicativos.map((aplicativo) => (
                          <SelectItem key={aplicativo} value={aplicativo}>
                            {aplicativo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="usuario_aplicativo" className="text-sm font-medium">
                      Usuário do Aplicativo <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="usuario_aplicativo"
                      name="usuario_aplicativo"
                      value={formData.usuario_aplicativo}
                      onChange={handleChange}
                      placeholder="Nome de usuário"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="senha_aplicativo" className="text-sm font-medium">
                      Senha do Aplicativo <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="senha_aplicativo"
                      name="senha_aplicativo"
                      type="password"
                      value={formData.senha_aplicativo}
                      onChange={handleChange}
                      placeholder="Senha do aplicativo"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="data_licenca_aplicativo" className="text-sm font-medium">
                      Data da Licença
                    </label>
                    <Input
                      id="data_licenca_aplicativo"
                      name="data_licenca_aplicativo"
                      type="date"
                      value={formData.data_licenca_aplicativo}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="possuiTelaAdicional"
                checked={possuiTelaAdicional}
                onCheckedChange={(checked) => {
                  setPossuiTelaAdicional(checked as boolean);
                }}
              />
              <label
                htmlFor="possuiTelaAdicional"
                className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acrescentar uma tela adicional
              </label>
            </div>

            {possuiTelaAdicional && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Tela Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="dispositivo_smart_2" className="text-sm font-medium">
                        Dispositivo Smart 2
                      </label>
                      <Select
                        value={formData.dispositivo_smart_2}
                        onValueChange={(value) => handleSelectChange("dispositivo_smart_2", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dispositivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {valoresPredefinidos?.dispositivos_smart.map((dispositivo) => (
                            <SelectItem key={dispositivo} value={dispositivo}>
                              {dispositivo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="aplicativo_2" className="text-sm font-medium">
                        Aplicativo 2
                      </label>
                      <Select
                        value={formData.aplicativo_2}
                        onValueChange={(value) => handleSelectChange("aplicativo_2", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o aplicativo" />
                        </SelectTrigger>
                        <SelectContent>
                          {valoresPredefinidos?.aplicativos.map((aplicativo) => (
                            <SelectItem key={aplicativo} value={aplicativo}>
                              {aplicativo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="usuario_2" className="text-sm font-medium">
                        Usuário 2
                      </label>
                      <Input
                        id="usuario_2"
                        name="usuario_2"
                        value={formData.usuario_2}
                        onChange={handleChange}
                        placeholder="Nome de usuário"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="senha_2" className="text-sm font-medium">
                        Senha 2
                      </label>
                      <Input
                        id="senha_2"
                        name="senha_2"
                        type="password"
                        value={formData.senha_2}
                        onChange={handleChange}
                        placeholder="Senha do aplicativo"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="data_licenca_2" className="text-sm font-medium">
                        Data da Licença 2
                      </label>
                      <Input
                        id="data_licenca_2"
                        name="data_licenca_2"
                        type="date"
                        value={formData.data_licenca_2}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Observações sobre o cliente"
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/clientes")}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Cliente
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CadastrarCliente;
