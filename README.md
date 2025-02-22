# 🌟 UTH Social Media App

Welcome to the **UTH Social Media App**, a social networking platform where users can interact with posts, follow others, and enjoy a variety of social features with a seamless experience. The app is powered by the **MERN stack** and **React Native** for mobile, ensuring a smooth and consistent user experience across all devices..

## 🚀 App Features

### 🕹️ **Core Features**

- **Authentication & Authorization with JWT** 🔑:  
  Secure user login and registration using JSON Web Tokens.

- **Email Verification** 📧:
  Verify your email address during registration to ensure account security and authenticity.

- **Reset Password** 🔒:
  Easily reset your password via email if you forget it.

- **Create Post** 📝:  
  Share your thoughts, photos with your followers.

- **Delete Post** 🗑️:  
  Remove posts that you no longer wish to share.

- **Like/Unlike Post** ❤️:  
  Engage with posts by liking or unliking them.

- **Comment to a Post** 💬:  
  Comment on posts and participate in discussions.

- **Follow/Unfollow Users** 👥:  
  Stay updated with your favorite users by following them, or unfollow them whenever needed.

- **Freeze Your Account** ❄️:  
  Temporarily disable your account to take a break from social media.

- **Dark/Light Mode** 🌓:  
  Switch between dark and light themes for a personalized experience.

- **Completely Responsive** 📱:  
  Enjoy the app on any device, optimized for web, Android and iOS

- **Chat App With Image Support** 💬:  
  Real-time chat with the ability to share images with friends.

- **Seen/Unseen Status for Messages** 👀:  
  Know when your messages have been seen by the recipient.

### 🧠 **Tech Stack**

- **MongoDB** 🛢: For database storage.
- **Express.js** 🚀: Server-side framework to handle HTTP requests.
- **React** ⚛️: For the front-end web application.
- **React Native (Expo)** ⚛️: For the front-end mobile application.
- **Node.js** 🔧: Back-end server environment to run JavaScript.
- **Socket.io** 🔌: Real-time communication for chat features and notifications.
- **Chakra UI & Tailwind CSS** 🎨: For building a clean and responsive User Interface.

## 🖥️ Installation

Follow the steps below to set up the project:

### 1. Clone the Repository

Clone the repository to your local machine by running the following command:

```bash
git clone https://github.com/tdimitr/UTH-Social-Media-App.git
```

### 2. Set Up the Back-end

Navigate to the backend directory and install the necessary dependencies:

```bash
cd backend
npm install
```

Once the dependencies are installed, start the backend server:

```bash
npm run dev
```

### 3. Set Up the Front-end (Web)

Navigate to the frontend/web directory and install the dependencies:

```bash
cd frontend/web
npm install
```

Start the frontend web app:

```bash
npm run dev
```

### 4. Set Up the Fron-tend (Mobile)

Navigate to the frontend/mobile directory and install the necessary packages:

```bash
cd frontend/mobile
npm install
```

Start the mobile app:

```bash
npm start
```

Scan the QR code with Expo Go (available on the Google Play Store or App Store) or use an Android Emulator or iOS Simulator (Xcode).

### 5. Environment Variables

- Ensure you configure the necessary environment variables by setting the values in .env.template, then renaming it to .env.
  - `WEB_URL`: The URL of the web version of your app (e.g., `http://localhost:3000` for local development).
  - `MOBILE_URL`: The URL for the mobile app.
  - `PORT`: The port on which the backend server will run (e.g., `5000`).
  - `MONGODB_URI`: The connection string to your MongoDB database. This is required for the back-end to interact with MongoDB.
  - `JWT_SECRET`: The secret key used for JWT (JSON Web Tokens) for authentication purposes. This key should be kept secure and not exposed publicly.
  - `CLOUDINARY_CLOUD_NAME`: The Cloudinary cloud name associated with your account, used to upload images or videos.
  - `CLOUDINARY_API_KEY`: The API key for your Cloudinary account.
  - `CLOUDINARY_API_SECRET`: The API secret for your Cloudinary account.
  - `EMAIL`: The email address used for sending emails.
  - `EMAIL_PASS`: The password associated with your email account for authentication.
  - `SECRET_KEY`: A secret key used for secure communication.
- Don't forget to set your Cloudinary credentials in the `frontend/mobile/src/context/uploadingImgToCloudinary.jsx` file by replacing `<CLOUD_NAME>` with your actual Cloudinary cloud name.
