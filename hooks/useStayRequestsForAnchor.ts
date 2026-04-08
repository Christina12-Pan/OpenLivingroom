"use client";

import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import type { StayRequestStatus } from "@/lib/types/database";
import { useEffect, useState } from "react";

export type StayRequestSlice = {
  check_in: string;
  check_out: string;
  status: StayRequestStatus;
};

/**
 * 订阅某 Anchor 的 stay_requests 变化并刷新列表（用于日历实时更新）
 * 父级应为每个 Anchor 设置稳定 key，以便 initial 与服务端一致。
 * @param anchorId - anchors.id
 * @param initial - 服务端初始数据
 */
export function useStayRequestsForAnchor(
  anchorId: string,
  initial: StayRequestSlice[]
): StayRequestSlice[] {
  const client = useSupabaseBrowserClient();
  const [rows, setRows] = useState<StayRequestSlice[]>(initial);

  useEffect(() => {
    if (!client) {
      return;
    }

    const refresh = async () => {
      const { data } = await client
        .from("stay_requests")
        .select("check_in, check_out, status")
        .eq("anchor_id", anchorId);
      if (data) {
        setRows(data as StayRequestSlice[]);
      }
    };

    const channel = client
      .channel(`stay_requests:${anchorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stay_requests",
          filter: `anchor_id=eq.${anchorId}`,
        },
        () => {
          void refresh();
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [anchorId, client]);

  return rows;
}
