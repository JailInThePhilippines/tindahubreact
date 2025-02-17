import { useState, useEffect, useCallback, useRef } from 'react';

interface Message {
  recipientId: string;
  recipientType: string;
  message: string;
}

interface FormattedMessage {
  senderId: string;
  senderType: string;
  recipientId: string;
  recipientType: string;
  content: string;
  timestamp: string;
}

type WebSocketAction = {
  action: string;
  [key: string]: any;
};

export function useWebSocket() {
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  
  /**
   * Establishes a WebSocket connection using the provided token and sender type.
   * @param token The authentication token.
   * @param senderType The type of the sender (e.g., user or vendor).
   */
  const connect = useCallback((token: string, senderType: string): void => {
    if (!token || !senderType) {
      console.error(
        'Token and senderType are required to establish a WebSocket connection.'
      );
      return;
    }

    socketRef.current = new WebSocket(
      `ws://localhost:3000/ws/chat?token=${token}&senderType=${senderType}`
    );
    
    socketRef.current.onopen = handleOpen;
    socketRef.current.onmessage = handleMessage;
    socketRef.current.onerror = handleError;
    socketRef.current.onclose = handleClose;
  }, []);

  /**
   * Handles the WebSocket `onopen` event.
   */
  const handleOpen = useCallback((): void => {
    getContacts();
  }, []);

  /**
   * Formats a raw message into a structured real-time message object.
   * @param message The raw message from the server.
   * @returns A formatted real-time message object.
   */
  const formatRealTimeMessage = useCallback((message: any): FormattedMessage => {
    return {
      senderId: message.sender.id,
      senderType: message.sender.type,
      recipientId: message.recipient.id,
      recipientType: message.recipient.type,
      content: message.message,
      timestamp: new Date(message.created_at).toLocaleString(),
    };
  }, []);

  /**
   * Handles incoming WebSocket messages.
   * @param event The message event containing data from the server.
   */
  const handleMessage = useCallback((event: MessageEvent): void => {
    const data = JSON.parse(event.data);

    if (data.status === 'success') {
      setMessages(prevMessages => [...prevMessages, data]);
      if (data.message) {
        const realTimeMessage = formatRealTimeMessage(data.message);
        console.log('New real-time message received:', realTimeMessage);
      }
    } else {
      console.error('Error from server:', data.error);
    }
  }, [formatRealTimeMessage]);

  /**
   * Handles WebSocket errors.
   * @param error The error event.
   */
  const handleError = useCallback((error: Event): void => {
    console.error('WebSocket error:', error);
  }, []);

  /**
   * Handles the WebSocket `onclose` event.
   * @param event The close event with details about the closure.
   */
  const handleClose = useCallback((event: CloseEvent): void => {
    console.log(
      `WebSocket connection closed: Code ${event.code}, Reason: ${event.reason}`
    );
  }, []);

  /**
   * Sends a general action to the WebSocket server.
   * @param payload The payload to be sent.
   */
  const sendAction = useCallback((payload: WebSocketAction): void => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.error('WebSocket connection is not open.');
    }
  }, []);

  /**
   * Sends a message to the WebSocket server.
   * @param message The message object containing recipientId, recipientType, and message content.
   */
  const sendMessage = useCallback((message: Message): void => {
    sendAction({ action: 'sendMessage', ...message });
  }, [sendAction]);

  /**
   * Requests the list of messages for a specific recipient.
   * @param recipientId The ID of the recipient whose messages are being fetched.
   */
  const getMessages = useCallback((recipientId: string): void => {
    sendAction({
      action: 'getMessages',
      senderType: 'vendor',
      recipientId,
    });
  }, [sendAction]);

  /**
   * Requests the list of contacts from the WebSocket server.
   */
  const getContacts = useCallback((): void => {
    sendAction({ action: 'getContacts' });
  }, [sendAction]);

  /**
   * Closes the WebSocket connection.
   */
  const close = useCallback((): void => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  // Clean up the WebSocket connection when the component unmounts
  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);

  return {
    messages,
    connect,
    sendMessage,
    getMessages,
    getContacts,
    close
  };
}