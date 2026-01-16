import { useCallback, useEffect, useRef, useState } from 'react';
import { GiftEvent, TIKTOK_GIFTS, TikTokGift } from '@/types/game';

export interface TikTokConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  roomId: string | null;
  viewerCount: number;
}

export interface TikTokLiveConfig {
  username?: string;
  onGift: (event: GiftEvent) => void;
  onViewerUpdate?: (count: number) => void;
  onChatMessage?: (message: { username: string; text: string }) => void;
}

/**
 * TikTok Live Integration Hook
 * 
 * Ready for real TikTok WebSocket integration.
 * Currently includes a simulation mode for testing.
 * 
 * To connect to real TikTok Live:
 * 1. Set up a TikTok-Live-Connector backend (Node.js)
 * 2. Connect via WebSocket to your backend
 * 3. Map TikTok gift events to game actions
 */
export const useTikTokLive = (config: TikTokLiveConfig) => {
  const { onGift, onViewerUpdate, onChatMessage } = config;
  
  const [connectionState, setConnectionState] = useState<TikTokConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    roomId: null,
    viewerCount: 0,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Map TikTok gift ID to our game gift
  const mapTikTokGift = useCallback((tiktokGiftId: number, giftName: string): TikTokGift | null => {
    // TikTok gift ID mapping - these are real TikTok gift IDs
    const giftMapping: Record<number, string> = {
      // Small gifts (1-49 coins)
      5655: 'rose',      // Rose
      5988: 'rose',      // GG
      5989: 'rose',      // Ice Cream Cone
      6537: 'iceCream',  // Rainbow
      
      // Medium gifts (50-299 coins)
      5879: 'bomb',      // Doughnut
      5881: 'disco',     // Finger Heart
      5892: 'shield',    // Hand Hearts
      6090: 'disco',     // Sunglasses
      
      // Large gifts (300+ coins)
      5900: 'galaxy',    // Drama Queen
      6064: 'galaxy',    // Mirror
      6067: 'crown',     // Galaxy
      6312: 'lion',      // Lion
      7274: 'lion',      // TikTok Universe
    };
    
    const mappedId = giftMapping[tiktokGiftId];
    if (mappedId && TIKTOK_GIFTS[mappedId]) {
      return TIKTOK_GIFTS[mappedId];
    }
    
    // Default fallback based on perceived value
    if (giftName.toLowerCase().includes('lion') || giftName.toLowerCase().includes('universe')) {
      return TIKTOK_GIFTS['lion'];
    }
    if (giftName.toLowerCase().includes('crown') || giftName.toLowerCase().includes('galaxy')) {
      return TIKTOK_GIFTS['galaxy'];
    }
    
    // Default to rose for unknown gifts
    return TIKTOK_GIFTS['rose'];
  }, []);
  
  // Connect to TikTok Live backend
  const connect = useCallback((backendUrl: string, tiktokUsername: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[TikTok] Already connected');
      return;
    }
    
    setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Connect to your TikTok-Live-Connector backend
      const ws = new WebSocket(`${backendUrl}?username=${encodeURIComponent(tiktokUsername)}`);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('[TikTok] WebSocket connected');
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          roomId: tiktokUsername,
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'gift':
              const mappedGift = mapTikTokGift(data.giftId, data.giftName);
              if (mappedGift) {
                const giftEvent: GiftEvent = {
                  id: `tiktok-${Date.now()}-${Math.random()}`,
                  gift: mappedGift,
                  username: data.uniqueId || data.nickname || 'TikTok User',
                  timestamp: Date.now(),
                  action: 'heal',
                };
                onGift(giftEvent);
              }
              break;
              
            case 'roomUser':
              setConnectionState(prev => ({ ...prev, viewerCount: data.viewerCount || 0 }));
              onViewerUpdate?.(data.viewerCount || 0);
              break;
              
            case 'chat':
              onChatMessage?.({
                username: data.uniqueId || 'User',
                text: data.comment || '',
              });
              break;
              
            case 'like':
              // Could trigger minor effects for likes
              break;
          }
        } catch (err) {
          console.error('[TikTok] Failed to parse message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('[TikTok] WebSocket error:', error);
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Connection failed',
        }));
      };
      
      ws.onclose = () => {
        console.log('[TikTok] WebSocket closed');
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        
        // Auto-reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (tiktokUsername) {
            connect(backendUrl, tiktokUsername);
          }
        }, 5000);
      };
    } catch (err) {
      console.error('[TikTok] Failed to connect:', err);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to establish connection',
      }));
    }
  }, [onGift, onViewerUpdate, onChatMessage, mapTikTokGift]);
  
  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
      roomId: null,
      viewerCount: 0,
    });
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    ...connectionState,
    connect,
    disconnect,
  };
};
