import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Script para detectar e sincronizar automaticamente a URL pública do túnel Cloudflare
 * executado no servidor deathstar-server.
 *
 * Atualiza automaticamente:
 * 1. .env.local
 * 2. src/lib/supabase.ts (fallback padrão)
 */
export async function syncTunnel(): Promise<string | null> {
  let activeUrl = "";

  try {
    const rawOutput = execSync(
      'ssh -o ConnectTimeout=5 -o BatchMode=yes sart@deathstar-server "docker logs strike-arena-tunnel 2>&1 | grep -o \'https://[a-zA-Z0-9-]*\\.trycloudflare\\.com\' | tail -n 1"',
      { encoding: "utf-8", timeout: 10000 }
    ).trim();

    if (rawOutput && rawOutput.startsWith("https://")) {
      activeUrl = rawOutput;
    }
  } catch (err) {
    console.warn("⚠️ Não foi possível consultar o servidor SSH no momento:", (err as Error).message);
    return null;
  }

  if (!activeUrl) {
    console.log("ℹ️ Nenhuma URL encontrada nos logs do túnel.");
    return null;
  }

  let updated = false;

  // 1. Atualizar .env.local
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    let content = fs.readFileSync(envLocalPath, "utf-8");
    const currentMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);

    if (currentMatch && currentMatch[1] !== activeUrl) {
      console.log(`🔄 Atualizando .env.local: ${currentMatch[1]} -> ${activeUrl}`);
      content = content.replace(
        /NEXT_PUBLIC_SUPABASE_URL="[^"]+"/,
        `NEXT_PUBLIC_SUPABASE_URL="${activeUrl}"`
      );
      fs.writeFileSync(envLocalPath, content, "utf-8");
      updated = true;
    } else if (!currentMatch) {
      content = `NEXT_PUBLIC_SUPABASE_URL="${activeUrl}"\n` + content;
      fs.writeFileSync(envLocalPath, content, "utf-8");
      updated = true;
    }
  }

  // 2. Atualizar src/lib/supabase.ts (fallback embutido)
  const supabaseTsPath = path.resolve(process.cwd(), "src/lib/supabase.ts");
  if (fs.existsSync(supabaseTsPath)) {
    let tsContent = fs.readFileSync(supabaseTsPath, "utf-8");
    const tsMatch = tsContent.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (tsMatch && tsMatch[0] !== activeUrl) {
      console.log(`🔄 Atualizando fallback em src/lib/supabase.ts: ${tsMatch[0]} -> ${activeUrl}`);
      tsContent = tsContent.replace(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g, activeUrl);
      fs.writeFileSync(supabaseTsPath, tsContent, "utf-8");
      updated = true;
    }
  }

  if (updated) {
    console.log(`✅ [Strike Arena] URLs sincronizadas com sucesso para ${activeUrl}`);
  } else {
    console.log(`✨ [Strike Arena] URL do túnel já está 100% atualizada (${activeUrl}).`);
  }

  return activeUrl;
}

// Execução direta via CLI
if (require.main === module || process.argv[1]?.endsWith("sync-tunnel.ts")) {
  syncTunnel().catch(console.error);
}
