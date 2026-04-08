/**
 * 解析 Supabase 的 URL 与 anon key（middleware / Server Components / 浏览器兜底）。
 *
 * **用方括号读 `process.env`：** 避免部分打包路径把 `NEXT_PUBLIC_*` 在「无 .env 的构建」里内联成空。
 * **不要在本文件里 `import @next/env`：** 否则会被 middleware / 客户端依赖链打进 Edge 与 browser，触发 `fs` 解析错误。
 *
 * 在 `app/layout.tsx` 顶部对 Node 服务端调用一次 `loadEnvConfig(process.cwd())`，保证读盘 `.env.local`。
 *
 * **浏览器仍优先用** {@link SupabaseBrowserProvider} 由 layout 注入。
 */

/**
 * 读取并校验 Supabase 公开连接信息
 * @returns 合法时返回 url 与 anon key，否则返回 null
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const nextPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const nextPublicAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const rawUrl = nextPublicUrl || process.env["SUPABASE_URL"]?.trim();
  const anonKey = nextPublicAnon || process.env["SUPABASE_ANON_KEY"]?.trim();

  if (!rawUrl || !anonKey) return null;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return { url: rawUrl, anonKey };
  } catch {
    return null;
  }
}
