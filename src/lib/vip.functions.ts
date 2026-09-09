import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const vipSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  whatsapp: z
    .string()
    .trim()
    .min(10, "Informe o WhatsApp com DDD")
    .max(20)
    .regex(/^[\d\s()+-]+$/, "WhatsApp inválido"),
  interest: z.string().trim().max(80).optional().nullable(),
});

export const joinVipList = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => vipSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("vip_waitlist").upsert(
      {
        name: data.name,
        email: data.email.toLowerCase(),
        whatsapp: data.whatsapp,
        interest: data.interest ?? null,
      },
      { onConflict: "email" },
    );
    if (error) throw new Error("Não foi possível entrar na lista agora.");
    return { ok: true };
  });

export const listVipWaitlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Sem permissão.");
    const { data } = await context.supabase
      .from("vip_waitlist")
      .select("id, name, email, whatsapp, interest, created_at")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const removeVipEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Sem permissão.");
    await context.supabase.from("vip_waitlist").delete().eq("id", data.id);
    return { ok: true };
  });
