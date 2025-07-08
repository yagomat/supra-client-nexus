
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input 
                  placeholder="seuemail@exemplo.com" 
                  {...field} 
                  disabled // Email não pode ser alterado diretamente
                />
              </FormControl>
              <FormDescription>
                O e-mail é usado para login e não pode ser alterado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(99) 99999-9999" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Form>
  );
}
