"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

const SupabaseBrowserContext = createContext<SupabaseClient | null>(null);

type SupabaseBrowserProviderProps = {
  children: ReactNode;
  /** 由根 layout（服务端）传入，来自 getSupabasePublicEnv() / process.env */
  url: string | null;
  anonKey: string | null;
};

/**
 * 在浏览器中提供单一 Supabase 实例。
 * URL / anon key 必须由服务端注入，避免客户端 bundle 无法内联 NEXT_PUBLIC_* 时初始化失败。
 */
export function SupabaseBrowserProvider({
  children,
  url,
  anonKey,
}: SupabaseBrowserProviderProps) {
  const client = useMemo(() => {
    if (!url || !anonKey) return null;
    try {
      return createBrowserClient(url, anonKey);
    } catch {
      return null;
    }
  }, [url, anonKey]);

  return (
    <SupabaseBrowserContext.Provider value={client}>
      {children}
    </SupabaseBrowserContext.Provider>
  );
}

/**
 * 读取由 {@link SupabaseBrowserProvider} 创建的浏览器端 Supabase 客户端
 * @returns 未配置或创建失败时为 null
 */
export function useSupabaseBrowserClient(): SupabaseClient | null {
  return useContext(SupabaseBrowserContext);
}
