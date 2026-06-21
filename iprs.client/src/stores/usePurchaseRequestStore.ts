import { create } from 'zustand';
import type {
  CreatePurchaseRequestDto,
  PurchaseRequestResponseDto,
  UpdatePurchaseRequestDto,
} from '@/schemas/purchaseRequest';
import {
  createPurchaseRequest,
  updatePurchaseRequest,
  getAllPurchaseRequests,
  submitPurchaseRequest,
} from '@/services/purchaseRequestService';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { Guid } from 'guid-typescript';

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
  updateRequest: (updatedRequest: UpdatePurchaseRequestDto) => void;
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

  updateRequest: async (dto) => {
    await updatePurchaseRequest(Guid.parse(dto.id), dto);
    channel.postMessage({
      type: 'REQUESTS_UPDATED',
    } satisfies RequestsSyncMessage);
  },

  createRequest: async (dto) => {
    const res = await createPurchaseRequest(dto);
    return res;
  },

  refreshPurchaseRequests: async () => {
    const data = await getAllPurchaseRequests(null, null, null, null);
    set({ purchaseRequests: data });
  },

  submitRequest: async (id) => {
    await submitPurchaseRequest(id);
  },

  initSignalR: async (token: string) => {
    const existingConnection = get().connection;

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

    connection.on(
      'ReceiveRequest',
      (newRequest: PurchaseRequestResponseDto) => {
        set((state) => {
          const targetId = newRequest.id?.toString().toLowerCase();
          const exists = state.purchaseRequests.some(
            (r) => r.id?.toString().toLowerCase() === targetId
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
      await connection.start();
      set({ connection, error: null });
      if (import.meta.env.DEV) {
        console.log('SignalR Connected securely via Zustand store.');
      }
    } catch (err) {
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
