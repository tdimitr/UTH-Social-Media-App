/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import userAtom from '../atoms/userAtom';
import { useRecoilValue } from 'recoil';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    // Only initialize the socket if the user ID exists
    if (!user?._id) {
      console.log('No user detected, skipping socket initialization.');
      return;
    }

    console.log('Initializing socket connection for user:', user._id);

    const socketInstance = io('http://localhost:5000', {
      query: {
        userId: user._id,
      },
    });

    setSocket(socketInstance);

    socketInstance.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
      console.log('Online users:', users);
    });

    return () => {
      console.log('Closing socket connection for user:', user._id);
      socketInstance.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
