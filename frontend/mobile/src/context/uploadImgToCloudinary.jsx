export const uploadImageToCloudinary = async (imageUri) => {
  const data = new FormData();
  data.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "profile.jpg",
  });
  data.append("upload_preset", "ml_default");
  data.append("cloud_name", "<CLOUD_NAME>");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/<CLOUD_NAME>/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
