import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — NUVE Advanced Skin Care" },
      {
        name: "description",
        content: "Fale com a NUVE Advanced Skin Care sobre pedidos, produtos e parcerias.",
      },
      { property: "og:title", content: "Contato — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Atendimento humano para pedidos e dúvidas de rotina." },
    ],
  }),
  component: Contato,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(160),
  message: z.string().trim().min(10, "Escreva um pouco mais").max(1000),
});

function Contato() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="eyebrow">Contato</p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">Fale com a gente</h1>
      <p className="mt-3 text-sm leading-relaxed text-ash">
        Atendimento de segunda a sexta, das 9h às 18h. Respondemos em até 1 dia útil.
      </p>
      <p className="mt-2 text-sm text-ash">
        E-mail:{" "}
        <a href="mailto:nuveadvanced@gmail.com" className="text-ink underline underline-offset-4">
          nuveadvanced@gmail.com
        </a>
      </p>

      <form
        className="mt-10 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = schema.safeParse(form);
          if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Revise os dados.");
            return;
          }
          const body = `Nome: ${parsed.data.name}\nE-mail: ${parsed.data.email}\n\n${parsed.data.message}`;
          window.location.href = `mailto:nuveadvanced@gmail.com?subject=${encodeURIComponent(
            "Contato pelo site — NUVE Advanced",
          )}&body=${encodeURIComponent(body)}`;
          toast.success("Abrindo seu e-mail para enviar a mensagem.");
        }}
      >

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-ash">Nome</span>
          <input
            value={form.name}
            maxLength={100}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full border border-input bg-ivory px-3 py-2.5 text-sm outline-none focus:border-clay"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-ash">E-mail</span>
          <input
            type="email"
            value={form.email}
            maxLength={160}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full border border-input bg-ivory px-3 py-2.5 text-sm outline-none focus:border-clay"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-ash">Mensagem</span>
          <textarea
            value={form.message}
            maxLength={1000}
            rows={5}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="mt-1 w-full border border-input bg-ivory px-3 py-2.5 text-sm outline-none focus:border-clay"
          />
        </label>
        <button type="submit" className="bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
          Enviar mensagem
        </button>
      </form>
    </div>
  );
}
