/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SendNotification = () => {
  const [notification, setNotification] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io('https://real-time-notification-app-z1f5.onrender.com/v1/notification', {
      transportOptions: {
        polling: {
          extraHeaders: {
            authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMSIsImlhdCI6MTczNjAxNTM3OX0.6OHORGS67XGldoxDT1kLPaPWkaD2QWdvhhAIQlqnDFg',
          },
        },
      },
    });

    // Handle socket connection
    socket.on('connect', () => {
      socket.emit('join-room');
    });

    // Handle incoming messages
    socket.on('send-message', (data) => {
      addMessage(data.data?.message || data.message);
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from socket');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to add a message at the top of the list
  const addMessage = (message:string) => {
    setNotifications((prev) => [message, ...prev]);
  };

  // Handle form submission
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!notification.trim()) return;

    const data = {
      user_id: '1',
      event_type: 'new_message',
      data: {
        message: notification,
        timestamp: new Date().toISOString(),
      },
    };

    // Show the message immediately in UI
    // addMessage(notification);

    // Clear input field
    setNotification('');

    // Send message to backend
    try {
      await fetch('https://real-time-notification-app-z1f5.onrender.com/api/notification/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl flex space-x-6">
        {/* Left Side: Input and Button */}
        <div className="w-1/2">
          <h2 className="text-xl font-bold mb-4">Send Notification</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={notification}
              onChange={(e) => setNotification(e.target.value)}
              className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your notification"
              id="message"
            />
            <button
              type="submit"
              className="bg-black text-white rounded w-full py-2 hover:bg-yellow-600"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right Side: Notification List */}
        <div
          id="notificationContainer"
          className="w-1/2 bg-gray-50 p-4 rounded shadow-inner overflow-y-auto max-h-[400px]"
        >
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <ul className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((note, index) => (
                <li key={index} className="bg-blue-100 text-blue-900 p-3 rounded shadow">
                  <div>{note}</div>
                  <div className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No notifications yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;
