import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import { getRecipientSocketId, io } from '../socket.js';
import { v2 as cloudinary } from 'cloudinary';

export async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    let { img } = req.body;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
          createdAt: new Date(),
        },
      });
      await conversation.save();
    } else {
      // Update last message if the conversation already exists
      await conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
          createdAt: new Date(),
        },
      });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || '',
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log('Error in sendMessage:', err.message);
  }
}

export async function sendMobileMessage(req, res) {
  try {
    const { recipientId, message, img } = req.body;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
          createdAt: new Date(),
        },
      });
      await conversation.save();
    } else {
      await conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
          createdAt: new Date(),
        },
      });
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || '',
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log('Error in sendMessage:', err.message);
  }
}

export async function getMessages(req, res) {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation)
      return res.status(404).json({ error: 'Conversation not found' });

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in getMessages:', err.message);
  }
}

export async function getConversations(req, res) {
  const userId = req.user._id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({ path: 'participants', select: 'username profilePic' })
      .sort({ 'lastMessage.createdAt': -1 })
      .exec();

    // remove the current user from the participants array
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString(),
      );
    });

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in getConversations:', err.message);
  }
}
