"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";
import { getAuthToken, getHubUrl, getVisitorId } from "@/lib/signalr";

export default function OnlineTracker() {
  const pathname = usePathname();
  const connRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const shouldTrack = !pathname.startsWith("/admin");

    if (!shouldTrack) {
      connRef.current?.stop();
      connRef.current = null;
      return;
    }

    // Guard against double-mount in React Strict Mode
    if (connRef.current) return;

    const hubUrl = getHubUrl("/hubs/location", { visitorId: getVisitorId() });

    // Do NOT use skipNegotiation so SignalR can fall back to
    // Server-Sent Events or Long Polling on mobile/proxied connections
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: getAuthToken })
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
      .build();

    connRef.current = conn;
    conn.start().catch((error) => {
      console.error("OnlineTracker SignalR connection failed:", hubUrl, error);
    });

    return () => {
      connRef.current?.stop();
      connRef.current = null;
    };
  }, [pathname]);

  return null;
}
