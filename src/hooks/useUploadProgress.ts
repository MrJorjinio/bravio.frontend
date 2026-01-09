'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { getTokens } from '@/lib/api';

const HUB_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export interface ChunkProgress {
  uploadId: string;
  chunkId: string;
  chunkIndex: number;
  totalChunks: number;
  completedChunks: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  summary?: string;
  keyPoints?: string[];
  flashcardCount: number;
  errorMessage?: string;
}

export interface UploadCompleted {
  uploadId: string;
  status: 'COMPLETED' | 'FAILED';
  totalChunks: number;
  totalFlashcards: number;
  errorMessage?: string;
}

interface UseUploadProgressOptions {
  onChunkProgress?: (data: ChunkProgress) => void;
  onUploadCompleted?: (data: UploadCompleted) => void;
  uploadId?: string;
}

export function useUploadProgress(options: UseUploadProgressOptions = {}) {
  const { onChunkProgress, onUploadCompleted, uploadId } = options;
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isConnectingRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Store callbacks in refs to prevent reconnection loops
  const onChunkProgressRef = useRef(onChunkProgress);
  const onUploadCompletedRef = useRef(onUploadCompleted);

  // Update refs when callbacks change (without triggering reconnection)
  useEffect(() => {
    onChunkProgressRef.current = onChunkProgress;
  }, [onChunkProgress]);

  useEffect(() => {
    onUploadCompletedRef.current = onUploadCompleted;
  }, [onUploadCompleted]);

  // Start connection - stable callback that doesn't depend on callback props
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      return;
    }

    // Don't reconnect if already connected
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Don't connect if already connecting or reconnecting
    if (connectionRef.current?.state === signalR.HubConnectionState.Connecting ||
        connectionRef.current?.state === signalR.HubConnectionState.Reconnecting) {
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) {
      setConnectionError('No access token available');
      return;
    }

    isConnectingRef.current = true;

    try {
      // Stop any existing connection first
      if (connectionRef.current) {
        try {
          await connectionRef.current.stop();
        } catch {
          // Ignore stop errors
        }
        connectionRef.current = null;
      }

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${HUB_URL}/hubs/upload-progress`, {
          accessTokenFactory: () => accessToken,
        })
        .withAutomaticReconnect([2000, 5000, 10000, 30000, 60000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Handle connection events
      connection.onclose((error) => {
        setIsConnected(false);
        isConnectingRef.current = false;
        if (error) {
          setConnectionError(error.message);
        }
      });

      connection.onreconnecting((error) => {
        setIsConnected(false);
        if (error) {
          console.warn('SignalR reconnecting:', error.message);
        }
      });

      connection.onreconnected(() => {
        setIsConnected(true);
        setConnectionError(null);
      });

      // Handle chunk progress - use ref to get current callback
      connection.on('ChunkProgress', (data: ChunkProgress) => {
        onChunkProgressRef.current?.(data);
      });

      // Handle upload completed - use ref to get current callback
      connection.on('UploadCompleted', (data: UploadCompleted) => {
        onUploadCompletedRef.current?.(data);
      });

      await connection.start();
      connectionRef.current = connection;
      setIsConnected(true);
      setConnectionError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect';
      setConnectionError(message);
      console.error('SignalR connection error:', error);
    } finally {
      isConnectingRef.current = false;
    }
  }, []); // No dependencies - stable callback

  // Subscribe to a specific upload
  const subscribeToUpload = useCallback(async (id: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('SubscribeToUpload', id);
      } catch (error) {
        console.error('Failed to subscribe to upload:', error);
      }
    }
  }, []);

  // Unsubscribe from a specific upload
  const unsubscribeFromUpload = useCallback(async (id: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('UnsubscribeFromUpload', id);
      } catch (error) {
        console.error('Failed to unsubscribe from upload:', error);
      }
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
      connectionRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Auto-subscribe to uploadId if provided
  useEffect(() => {
    if (uploadId && isConnected) {
      subscribeToUpload(uploadId);
    }
  }, [uploadId, isConnected, subscribeToUpload]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToUpload,
    unsubscribeFromUpload,
  };
}

export default useUploadProgress;
