
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Cliente } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "./table/PhoneFormatter";
import { SafeText } from "@/components/security/SafeText";

interface ClienteModalsProps {
  clienteDetalhes: Cliente | null;
  isViewModalOpen: boolean;
  setIsViewModalOpen: (value: boolean) => void;
  isTelaAdicionaModalOpen: boolean;
  setIsTelaAdicionaModalOpen: (value: boolean) => void;
  isObservacoesModalOpen: boolean;
  setIsObservacoesModalOpen: (value: boolean) => void;
  clienteParaExcluir: string | null;
  setClienteParaExcluir: (value: string | null) => void;
  handleExcluir: () => void;
}

export const ClienteModals = ({
  clienteDetalhes,
  isViewModalOpen,
  setIsViewModalOpen,
  isTelaAdicionaModalOpen,
  setIsTelaAdicionaModalOpen,
  isObservacoesModalOpen,
  setIsObservacoesModalOpen,
  clienteParaExcluir,
  setClienteParaExcluir,
  handleExcluir
}: ClienteModalsProps) => {
  return (
    <>
      {/* Modal para visualizar todos os detalhes do cliente */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {clienteDetalhes && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Informações Básicas
                  <Badge variant={clienteDetalhes.status === 'ativo' ? 'default' : 'secondary'}>
                    {clienteDetalhes.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="font-medium">
                      <SafeText>{clienteDetalhes.nome}</SafeText>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p>{formatPhoneNumber(clienteDetalhes.telefone) || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">UF</p>
                    <p><SafeText>{clienteDetalhes.uf || "-"}</SafeText></p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Servidor</p>
                    <p><SafeText>{clienteDetalhes.servidor}</SafeText></p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dia Vencimento</p>
                    <p>{clienteDetalhes.dia_vencimento}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor do Plano</p>
                    <p>R$ {clienteDetalhes.valor_plano?.toFixed(2).replace('.', ',') || "0,00"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
                    <p>{formatDate(clienteDetalhes.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Tela Principal */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tela Principal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dispositivo Smart</p>
                    <p><SafeText>{clienteDetalhes.dispositivo_smart || "-"}</SafeText></p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aplicativo</p>
                    <p><SafeText>{clienteDetalhes.aplicativo}</SafeText></p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Usuário</p>
                    <p><SafeText>{clienteDetalhes.usuario_aplicativo}</SafeText></p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Senha</p>
                    <p><SafeText>{clienteDetalhes.senha_aplicativo}</SafeText></p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Data da Licença</p>
                    <p>{clienteDetalhes.data_licenca_aplicativo ? formatDate(clienteDetalhes.data_licenca_aplicativo) : "-"}</p>
                  </div>
                </div>
              </div>

              {/* Tela Adicional */}
              {clienteDetalhes.possui_tela_adicional && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tela Adicional</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dispositivo Smart 2</p>
                      <p><SafeText>{clienteDetalhes.dispositivo_smart_2 || "-"}</SafeText></p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Aplicativo 2</p>
                      <p><SafeText>{clienteDetalhes.aplicativo_2 || "-"}</SafeText></p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Usuário 2</p>
                      <p><SafeText>{clienteDetalhes.usuario_2 || "-"}</SafeText></p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Senha 2</p>
                      <p><SafeText>{clienteDetalhes.senha_2 || "-"}</SafeText></p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Data da Licença 2</p>
                      <p>{clienteDetalhes.data_licenca_2 ? formatDate(clienteDetalhes.data_licenca_2) : "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              {clienteDetalhes.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <SafeText 
                      preserveLineBreaks={true}
                      className="whitespace-pre-wrap"
                    >
                      {clienteDetalhes.observacoes}
                    </SafeText>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para visualizar detalhes da tela adicional */}
      <Dialog open={isTelaAdicionaModalOpen} onOpenChange={setIsTelaAdicionaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Tela Adicional</DialogTitle>
          </DialogHeader>
          {clienteDetalhes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dispositivo Smart 2</p>
                  <p><SafeText>{clienteDetalhes.dispositivo_smart_2 || "-"}</SafeText></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aplicativo 2</p>
                  <p><SafeText>{clienteDetalhes.aplicativo_2 || "-"}</SafeText></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuário 2</p>
                  <p><SafeText>{clienteDetalhes.usuario_2 || "-"}</SafeText></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Senha 2</p>
                  <p><SafeText>{clienteDetalhes.senha_2 || "-"}</SafeText></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data da Licença 2</p>
                  <p>{clienteDetalhes.data_licenca_2 ? formatDate(clienteDetalhes.data_licenca_2) : "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para visualizar observações */}
      <Dialog open={isObservacoesModalOpen} onOpenChange={setIsObservacoesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Observações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <SafeText preserveLineBreaks={true}>
              {clienteDetalhes?.observacoes}
            </SafeText>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!clienteParaExcluir} onOpenChange={(open) => !open && setClienteParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
