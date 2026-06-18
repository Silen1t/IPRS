import { create } from 'zustand';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';

import type { PurchaseRequestResponseDto } from '@/schemas/purchaseRequest';
import { getAllPurchaseRequests } from '@/services/purchaseRequestService';

interface RequestState {
  purchaseRequests: PurchaseRequestResponseDto[];
  connection: HubConnection | null;
  initPurchaseRequests: () => Promise<void>;
  initSignalR: (token: string) => void;
  disconnectSignalR: () => void;
}

export const usePurchaseRequestStore = create<RequestState>((set, get) => ({
  purchaseRequests: [],
  connection: null,

  initPurchaseRequests: async () => {
    try {
      const data = await getAllPurchaseRequests(null, null, null, null);
      set({ purchaseRequests: data });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to load requests:', err);
    }
  },

  initSignalR: (token: string) => {
    if (get().connection) return;

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7209/api/hubs/purchase-requests', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection
      .start()
      .then(() => {
        if (import.meta.env.DEV) {
          console.log('SignalR Connected securely via Zustand store.');
        }

        connection.on(
          'ReceiveRequest',
          (newRequest: PurchaseRequestResponseDto) => {
            set((state) => ({
              purchaseRequests: [newRequest, ...state.purchaseRequests],
            }));
          }
        );
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.error('SignalR Hub initialization failed:', err);
        }
      });

    set({ connection });
  },

  disconnectSignalR: () => {
    const { connection } = get();
    if (connection) {
      connection.stop();
      set({ connection: null });
    }
  },
}));
