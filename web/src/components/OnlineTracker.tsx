"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

const VISITOR_ID_KEY = "ft_visitor_id";

function getVisitorId() {
  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}

export default function OnlineTracker() {
  const pathname = usePathname();
  const connRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const shouldTrack =
      !pathname.startsWith("/admin") &&
      !pathname.startsWith("/owner") &&
      pathname !== "/login" &&
      pathname !== "/signup";

    if (!shouldTrack) {
      connRef.current?.stop();
      connRef.current = null;
      return;
    }

    // Guard against double-mount in React Strict Mode
    if (connRef.current) return;

    const hubUrl = new URL(
      "/hubs/location",
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5190",
    );
    hubUrl.searchParams.set("visitorId", getVisitorId());

    const getToken = () =>
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("ft_token="))
        ?.split("=")[1] || "";

    // Do NOT use skipNegotiation so SignalR can fall back to
    // Server-Sent Events or Long Polling on mobile/proxied connections
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl.toString(), { accessTokenFactory: getToken })
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
      .build();

    connRef.current = conn;
    conn.start().catch(() => {});

    return () => {
      connRef.current?.stop();
      connRef.current = null;
    };
  }, [pathname]);

  return null;
}
