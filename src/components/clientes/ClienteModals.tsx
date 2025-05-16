
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Cliente } from "@/types";
import { formatDate } from "@/utils/dateUtils";

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
      {/* Modal para visualizar detalhes da tela principal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Tela Principal</DialogTitle>
          </DialogHeader>
          {clienteDetalhes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dispositivo Smart</p>
                  <p>{clienteDetalhes.dispositivo_smart || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aplicativo</p>
                  <p>{clienteDetalhes.aplicativo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuário</p>
                  <p>{clienteDetalhes.usuario_aplicativo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Senha</p>
                  <p>{clienteDetalhes.senha_aplicativo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data da Licença</p>
                  <p>{clienteDetalhes.data_licenca_aplicativo ? formatDate(clienteDetalhes.data_licenca_aplicativo) : "-"}</p>
                </div>
              </div>
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
                  <p>{clienteDetalhes.dispositivo_smart_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aplicativo 2</p>
                  <p>{clienteDetalhes.aplicativo_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuário 2</p>
                  <p>{clienteDetalhes.usuario_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Senha 2</p>
                  <p>{clienteDetalhes.senha_2 || "-"}</p>
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
            <p>{clienteDetalhes?.observacoes}</p>
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
