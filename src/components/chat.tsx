import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../services/websocket-service';
import Navbar from './navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useAuthService } from '../services/auth-service';

interface Contact {
  user_id: string;
  name: string;
}

interface Message {
  senderType: string;
  content: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const [showContacts, setShowContacts] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const authService = useAuthService();
  const { messages: wsMessages, connect, sendMessage, getMessages } = useWebSocket();

  // Check screen size on mount and on resize
  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeScreen(isLarge);
      setShowContacts(isLarge);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = authService.getToken();
    const senderType = 'vendor';

    if (token) {
      connect(token, senderType);
    } else {
      console.error('Unable to connect: No token found.');
    }
  }, [connect, authService]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (wsMessages.length > 0) {
      const latestMessage = wsMessages[wsMessages.length - 1];
      
      if (latestMessage.contacts) {
        updateContacts(latestMessage.contacts);
      } else if (latestMessage.messages && selectedContact) {
        updateMessageHistory(latestMessage.messages);
      } else if (latestMessage.message) {
        processRealTimeMessage(latestMessage.message);
      }
    }
  }, [wsMessages, selectedContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateContacts = (contactsData: any[]) => {
    setContacts(contactsData.map(contact => ({
      user_id: contact.user_id || contact._id,
      name: contact.name
    })));
  };

  const updateMessageHistory = (messagesData: any[]) => {
    setMessages(messagesData.map((msg) => ({
      senderType: msg.sender.type,
      content: msg.message,
      timestamp: new Date(msg.created_at).toLocaleString(),
    })));
  };

  const processRealTimeMessage = (message: any) => {
    const newMsg = {
      senderType: message.sender.type,
      content: message.message,
      timestamp: new Date(message.created_at).toLocaleString(),
    };

    // Check if this message is already in the current chat
    const isDuplicate = messages.some(
      msg => msg.content === newMsg.content &&
        msg.timestamp === newMsg.timestamp
    );

    if (!isDuplicate &&
      selectedContact &&
      (message.sender.id === selectedContact.user_id ||
        message.recipient.id === selectedContact.user_id)) {
      setMessages(prevMessages => [...prevMessages, newMsg]);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      sendMessage({
        recipientId: selectedContact.user_id.toString(),
        recipientType: 'user',
        message: newMessage,
      });

      // Add message locally
      setMessages(prevMessages => [
        ...prevMessages,
        {
          senderType: 'vendor',
          content: newMessage,
          timestamp: new Date().toLocaleString(),
        }
      ]);
      
      setNewMessage('');
    } else {
      console.error('No message or contact selected.');
    }
  };

  const toggleContacts = () => {
    setShowContacts(prev => !prev);
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
    getMessages(contact.user_id);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.split(' ');
    return words
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 1);
  };

  return (
    <div>
      <Navbar />
      
      <div className="p-4 sm:ml-64">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-lg mt-14 flex flex-col lg:flex-row gap-6 h-screen lg:h-[870px] md:h-[750px]">
          
          {/* Sidebar for Contact List */}
          {(showContacts || isLargeScreen) && (
            <div className="lg:w-1/4 bg-white shadow-lg dark:bg-gray-800 rounded-lg p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Contacts</h2>
              <ul>
                {contacts.map(contact => (
                  <li key={contact.user_id} className="mb-3">
                    <button
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-3"
                      onClick={() => selectContact(contact)}
                    >
                      {/* Initials Avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {getInitials(contact.name)}
                      </div>
                      <span className="dark:text-gray-300 font-medium">
                        {contact.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chatbox */}
          <div className="lg:w-3/4 bg-white dark:bg-gray-900 shadow-lg rounded-lg flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              {selectedContact ? (
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold mr-3">
                    {getInitials(selectedContact.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white">
                      {selectedContact.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Online</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Select a contact to start chatting
                </div>
              )}

              {/* Toggle Button for Contact List */}
              <button
                className="lg:hidden p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={toggleContacts}
              >
                📜 Contacts
              </button>
            </div>

            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-4 overflow-y-auto"
            >
              {!selectedContact ? (
                <div className="flex justify-center text-center text-gray-500 dark:text-gray-400">
                  Click on a contact to start chatting!
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex items-end ${message.senderType === 'vendor' ? 'justify-end' : ''}`}
                  >
                    {/* Avatar for non-vendor messages */}
                    {message.senderType !== 'vendor' && (
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold mr-3">
                        {getInitials(selectedContact?.name || "")}
                      </div>
                    )}

                    {/* Message Container */}
                    <div>
                      <div
                        className={`p-3 rounded-lg max-w-md ${
                          message.senderType === 'vendor'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="text-sm">
                          {message.content}
                        </div>
                      </div>
                      {/* Timestamp */}
                      <div
                        className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                          message.senderType === 'vendor' ? 'text-right' : ''
                        }`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            {selectedContact && (
              <div className="p-4 border-t dark:border-gray-700 flex items-center gap-3 bg-gray-50 dark:bg-gray-900">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  type="text"
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-3 rounded-lg hover:bg-blue-600 text-blue-500 hover:text-white"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;