import { useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export function useWebSocket() {
  const clientRef = useRef(null);

  const connect = useCallback((token, myId, { onMessage, onStatus, onTyping, onPresence, onConnected }) => {
    
    if (clientRef.current) return; 

    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      debug: () => {},

      onConnect: () => {
        
        client.subscribe(`/topic/messages/${myId}`, frame => {
          try { onMessage(JSON.parse(frame.body)); } catch {}
        });

        client.subscribe(`/topic/typing/${myId}`, frame => {
          try { onTyping(JSON.parse(frame.body)); } catch {}
        });

        client.subscribe(`/topic/status/${myId}`, frame => {
          onStatus(frame.body.replace(/"/g, ''));
        });

        client.subscribe('/topic/public', frame => {
          try { if (onPresence) onPresence(JSON.parse(frame.body)); } catch {}
        });

        client.publish({
          destination: '/app/user.connect',
          body: JSON.stringify({ userId: myId.toString() })
        });

        onConnected?.();
      },
    });

    client.activate();
    clientRef.current = client;
  }, []);

  const disconnect = useCallback((myId) => {
    if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
            destination: '/app/user.disconnect',
            body: JSON.stringify({ userId: myId?.toString() || "" })
        });
        
        setTimeout(() => {
            clientRef.current.deactivate();
            clientRef.current = null;
        }, 50);
    }
  }, []);

  const send = useCallback((destination, body) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }, []);

  const isConnected = useCallback(() => {
    return clientRef.current?.connected ?? false;
  }, []);

  return { connect, disconnect, send, isConnected };
}