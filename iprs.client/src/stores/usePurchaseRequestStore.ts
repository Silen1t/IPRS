import { create } from 'zustand';
import type {
  CreatePurchaseRequestDto,
  PurchaseRequestResponseDto,
} from '@/schemas/purchaseRequest';
import {
  createPurchaseRequest,
  getAllPurchaseRequests,
  submitPurchaseRequest,
} from '@/services/purchaseRequestService';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import type { Guid } from 'guid-typescript';

interface RequestState {
  purchaseRequests: PurchaseRequestResponseDto[];
  connection: HubConnection | null;
  isLoading: boolean;
  error: string | null;
  initSignalR: (token: string) => Promise<void>;
  disconnectSignalR: () => void;
  initPurchaseRequests: () => Promise<void>;
  refreshPurchaseRequests: () => Promise<void>;
  submitRequest: (id: Guid) => Promise<void>;
  updateSingleRequestInStore: (
    updatedRequest: PurchaseRequestResponseDto
  ) => void;
  createRequest: (
    dto: CreatePurchaseRequestDto
  ) => Promise<PurchaseRequestResponseDto>;
}

interface RequestsSyncMessage {
  type: 'REQUESTS_UPDATED';
}

const CHANNEL_NAME = 'requests_sync';
const channel = new BroadcastChannel(CHANNEL_NAME);

const usePurchaseRequestStore = create<RequestState>((set, get) => ({
  purchaseRequests: [],
  connection: null,
  isLoading: false,
  error: null,

  initPurchaseRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await getAllPurchaseRequests(null, null, null, null);
      set({ purchaseRequests: data });
    } catch (err) {
      set({ error: 'Failed to retrieve purchase registries.' });
      if (import.meta.env.DEV) console.error('Failed to load requests:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSingleRequestInStore: (updatedRequest) => {
    set((state) => ({
      purchaseRequests: state.purchaseRequests.map((r) =>
        r.id === updatedRequest.id ? updatedRequest : r
      ),
    }));
  },

  createRequest: async (dto) => {
    const res = await createPurchaseRequest(dto);
    return res;
  },

  refreshPurchaseRequests: async () => {
    const data = await getAllPurchaseRequests(null, null, null, null);
    set({ purchaseRequests: data });
    channel.postMessage({
      type: 'REQUESTS_UPDATED',
    } satisfies RequestsSyncMessage);
  },

  submitRequest: async (id) => {
    await submitPurchaseRequest(id)
  },

  initSignalR: async (token: string) => {
    const existingConnection = get().connection;

    // 🌟 Check the actual Hub state, not just object existence
    if (existingConnection && existingConnection.state !== 'Disconnected') {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7209/api/hubs/purchase-requests', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    // Set up listeners immediately
    connection.on(
      'ReceiveRequest',
      (newRequest: PurchaseRequestResponseDto) => {
        set((state) => {
          const exists = state.purchaseRequests.some(
            (r) => r.id === newRequest.id
          );
          const updatedRequests = exists
            ? state.purchaseRequests.map((r) =>
                r.id === newRequest.id ? newRequest : r
              )
            : [newRequest, ...state.purchaseRequests];

          return { purchaseRequests: updatedRequests };
        });
      }
    );

    try {
      // 🌟 Only save to state if connection successfully opens
      await connection.start();
      set({ connection, error: null });
      if (import.meta.env.DEV) {
        console.log('SignalR Connected securely via Zustand store.');
      }
    } catch (err) {
      // 🌟 Clean up state on connection failure to allow automated retries
      set({ connection: null });
      if (import.meta.env.DEV) {
        console.error('SignalR Hub initialization failed:', err);
      }
    }
  },

  disconnectSignalR: () => {
    const { connection } = get();
    if (connection) {
      connection.stop();
      set({ connection: null });
    }
  },
}));

channel.onmessage = (event: MessageEvent<RequestsSyncMessage>) => {
  if (event.data?.type === 'REQUESTS_UPDATED') {
    usePurchaseRequestStore.getState().refreshPurchaseRequests();
  }
};

export default usePurchaseRequestStore;