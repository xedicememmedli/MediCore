import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = `${process.env.REACT_APP_API_URL}/hubs/chat`;

/**
 * useChatSignalR — Bütün chat panelləri üçün ortaq SignalR hook
 *
 * İstifadə:
 *   const { connected, sendMessage } = useChatSignalR(onMessageReceived);
 *
 * onMessageReceived(message) — yeni mesaj gəldikdə çağırılır
 *   message: { senderId, receiverId, content, sentAt }
 */
export function useChatSignalR(onMessageReceived) {
  const connectionRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Yeni mesaj gəldikdə
    connection.on("ReceiveMessage", (message) => {
      if (onMessageReceived) onMessageReceived(message);
    });

    // Qoşulma hadisələri
    connection.onreconnecting(() => {
      setConnected(false);
      setError("Yenidən qoşulur...");
    });
    connection.onreconnected(() => {
      setConnected(true);
      setError(null);
    });
    connection.onclose(() => {
      setConnected(false);
    });

    // Qoşul
    connection
      .start()
      .then(() => {
        setConnected(true);
        setError(null);
        console.log("[SignalR] Qoşuldu");
      })
      .catch((err) => {
        setError("SignalR qoşulması alınmadı");
        console.error("[SignalR] Xəta:", err);
      });

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mesaj göndər
  const sendMessage = useCallback(async (receiverId, content) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      return false;
    }
    try {
      await conn.invoke("SendMessage", { receiverId, content });
      return true;
    } catch (err) {
      console.error("[SignalR] Göndərmə xətası:", err);
      return false;
    }
  }, []);

  return { connected, error, sendMessage };
}
