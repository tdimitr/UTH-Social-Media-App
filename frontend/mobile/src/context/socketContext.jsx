import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import * as SecureStore from "expo-secure-store";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info and token from SecureStore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserInfo = await SecureStore.getItemAsync("userInfo");
        const storedUserToken = await SecureStore.getItemAsync("userToken");

        if (storedUserInfo && storedUserToken) {
          setUserInfo(JSON.parse(storedUserInfo));
          setUserToken(storedUserToken);
        } else {
          setUserInfo(null);
          setUserToken(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Initialize socket connection when user is logged in
  useEffect(() => {
    if (!loading && userInfo?._id && userToken) {
      console.log("Initializing socket connection for user:", userInfo._id);

      // Initialize socket connection
      const socketInstance = io("http://192.168.1.6:5000", {
        query: { userId: userInfo._id },
      });

      setSocket(socketInstance);

      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
        console.log("Online users:", users);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      return () => {
        console.log("Disconnecting socket for user:", userInfo._id);
        socketInstance.disconnect();
      };
    } else {
      console.log("Waiting for user data. Socket not initialized.");
    }
  }, [userInfo, userToken, loading]);

  // Handle socket disconnection on logout
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("userInfo");
      await SecureStore.deleteItemAsync("userToken");
      setUserInfo(null);
      setUserToken(null);

      if (socket) {
        socket.disconnect();
        console.log("Socket disconnected on logout.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, logout }}>
      {children}
    </SocketContext.Provider>
  );
};
