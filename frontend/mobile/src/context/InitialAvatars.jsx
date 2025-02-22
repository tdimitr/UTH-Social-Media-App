import React from "react";
import { View, Text } from "react-native";

// Helper function to generate a consistent color based on the name
const getColorFromName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${((hash >> 24) & 0xff).toString(16).padStart(2, "0")}${(
    (hash >> 16) &
    0xff
  )
    .toString(16)
    .padStart(2, "0")}${((hash >> 8) & 0xff)
    .toString(16)
    .padStart(2, "0")}`.slice(0, 7);
  return color;
};

// Avatar Component
const InitialsAvatar = ({ name, size = 100 }) => {
  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0].toUpperCase())
          .join("")
          .slice(0, 2)
      : "";
  };

  const color = getColorFromName(name);

  return (
    <View
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: size / 3, fontWeight: "bold" }}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

export default InitialsAvatar;
