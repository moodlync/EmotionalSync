import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

// Default context value
const defaultContextValue: WebSocketContextType = {
  socket: null,
  isConnected: false,
  sendMessage: () => {},
};

const WebSocketContext = createContext<WebSocketContextType>(defaultContextValue);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    let ws: WebSocket;
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        // Try to reconnect after a delay
        setTimeout(() => {
          setSocket(null);
        }, 5000);
      };
      
      setSocket(ws);
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  return context;
}
