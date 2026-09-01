import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type UploadInput = { name: string; type: string; dataBase64: string };

function safeName(name: string) {
  const clean = (name || "foto.jpg").toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
  return `${Date.now()}-${clean}`;
}

/** Upload de foto pelo painel: valida admin, grava no bucket privado e devolve a URL pública de leitura. */
export const uploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UploadInput) => {
    if (!input?.dataBase64) throw new Error("Arquivo inválido.");
    if (!/^image\/(jpeg|png|webp|jpg|avif)$/.test(input.type ?? "")) throw new Error("Envie uma imagem JPG, PNG ou WebP.");
    if (input.dataBase64.length > 14_000_000) throw new Error("Imagem muito grande (máx. 10MB).");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Sem permissão.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Buffer.from(data.dataBase64, "base64");
    const path = safeName(data.name);

    const { error } = await supabaseAdmin.storage.from("midia").upload(path, bytes, {
      contentType: data.type,
      upsert: false,
    });
    if (error) throw new Error("Falha ao enviar a imagem.");

    return { url: `/api/public/midia/${path}` };
  });
