'use client';

import { useEffect } from 'react';
import authStore from '@/shared/stores/auth-store';
import userStore, { IBalanceUpdateEvent } from '@/shared/stores/user-store';

interface WsEnvelope {
  type?: string;
  data?: unknown;
}

const isBalanceUpdateEvent = (data: unknown): data is IBalanceUpdateEvent => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const event = data as Partial<IBalanceUpdateEvent>;
  return (
    typeof event.balance === 'number' &&
    typeof event.delta === 'number' &&
    typeof event.counterparty === 'string' &&
    typeof event.transaction_id === 'number' &&
    (event.direction === 'incoming' || event.direction === 'outgoing' || event.direction === 'self')
  );
};

const websocketUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  const url = new URL('/ws', baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};

const remainsAuthenticated = (): boolean => {
  const { logged, authed, registered } = authStore.getState().userStatus;
  return logged && authed && registered;
};

export const useBalanceWebSocket = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    let socket: WebSocket | undefined;
    let reconnectTimer: number | undefined;
    let reconnectAttempt = 0;
    let refreshAfterReconnect = false;
    let closedByEffect = false;

    const clearReconnectTimer = () => {
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
      }
    };

    const refreshCurrentUser = () => {
      const username = userStore.getState().store.userData.username;
      if (username) {
        void userStore.getState().refreshUserData(username);
      }
    };

    const connect = () => {
      clearReconnectTimer();
      socket = new WebSocket(websocketUrl());

      socket.onopen = () => {
        reconnectAttempt = 0;
        if (refreshAfterReconnect) {
          refreshAfterReconnect = false;
          refreshCurrentUser();
        }
      };

      socket.onmessage = event => {
        try {
          const message = JSON.parse(event.data) as WsEnvelope;
          if (
            message.type === 'transaction.balance.updated' &&
            isBalanceUpdateEvent(message.data)
          ) {
            userStore.getState().applyBalanceUpdate(message.data);
          }
        } catch (error) {
          console.error('Failed to parse websocket message:', error);
        }
      };

      socket.onclose = () => {
        if (closedByEffect || !remainsAuthenticated()) {
          return;
        }

        refreshAfterReconnect = true;
        const delayMs = Math.min(1000 * 2 ** reconnectAttempt, 15000);
        reconnectAttempt += 1;
        reconnectTimer = window.setTimeout(connect, delayMs);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      clearReconnectTimer();
      socket?.close();
    };
  }, [enabled]);
};
