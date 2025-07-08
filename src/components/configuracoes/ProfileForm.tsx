
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSecureProfile } from "@/hooks/useSecureProfile";

const profileFormSchema = z.object({
  nome: z
    .string()
    .min(2, {
      message: "O nome deve ter pelo menos 2 caracteres.",
    })
    .max(30, {
      message: "O nome não pode ter mais de 30 caracteres.",
    }),
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email("E-mail inválido."),
  telefone: z
    .string()
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user } = useAuth();
  const { updateProfile, isUpdating } = useSecureProfile();

  const defaultValues: Partial<ProfileFormValues> = {
    nome: user?.nome || "",
    email: user?.email || "",
    telefone: "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  // Carregue os dados adicionais do usuário (como telefone) se necessário
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from("profiles")
            .select("telefone")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            // Agora telefone existe no objeto data
            form.setValue("telefone", data.telefone || "");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };

    loadUserProfile();
  }, [user?.id, form]);

const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        nome: data.nome,
        telefone: data.telefone || undefined
      });
    } catch (error) {
      // Erro já tratado no hook
      console.error("Erro ao submeter formulário:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 form-enhanced">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="form-label text-sm font-semibold">Nome Completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Digite seu nome completo" 
                  {...field} 
                  className="transition-all duration-300 border-2 focus:border-primary focus:ring-0 focus:shadow-glow bg-gradient-card hover:bg-gradient-subtle"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="form-label text-sm font-semibold">E-mail</FormLabel>
              <FormControl>
                <Input 
                  placeholder="seuemail@exemplo.com" 
                  {...field} 
                  disabled
                  className="transition-all duration-300 border-2 bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border-l-2 border-primary/30">
                O e-mail é usado para login e não pode ser alterado por questões de segurança.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="form-label text-sm font-semibold">Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(99) 99999-9999" 
                  {...field}
                  value={field.value || ""}
                  className="transition-all duration-300 border-2 focus:border-primary focus:ring-0 focus:shadow-glow bg-gradient-card hover:bg-gradient-subtle"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4 border-t border-border/50">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="btn-enhanced w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-soft hover:shadow-medium transition-all duration-300"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </span>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
