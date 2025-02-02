import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text)
      return res
        .status(400)
        .json({ error: 'postedBy and text fields are required' });

    const user = await User.findById(postedBy);
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (user._id.toString() !== req.user._id.toString())
      return res.status(401).json({ error: 'Unauthorized to create post' });

    const maxLength = 500;
    if (text.length > maxLength)
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });

    if (img) {
      // Upload the image to Cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(img);
      // Set the img URL to that returned by Cloudinary
      img = uploadedResponse.secure_url;
    }

    // Create a new post with provided data and save them to mongoDB
    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in createPost:', err.message);
  }
};

export const createMobilePost = async (req, res) => {
  try {
    const { postedBy, text, img } = req.body;

    // Validate required fields
    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: 'postedBy and text fields are required' });
    }

    // Validate user existence
    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if the user is authorized
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized to create post' });
    }

    // Validate text length
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    // No image upload logic; just accept the URL
    if (img && !img.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid image URL provided' });
    }

    // Create a new post and save to MongoDB
    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error in createMobilePost:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in getPost:', err.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.postedBy.toString() !== req.user._id.toString())
      return res.status(401).json({ error: 'Unauthorized to delete post' });

    if (post.img) {
      const imgId = post.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in deletePost:', err.message);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      //Like post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: 'Post liked successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in likeUnlikePost:', err.message);
  }
};

export const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) return res.status(400).json({ error: 'Text field is required' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const reply = { userId, text, userProfilePic, username };
    post.replies.push(reply);
    await post.save();

    // Get the newly created reply with all required fields
    const newReply = post.replies[post.replies.length - 1];
    res.status(200).json(newReply); // Send back complete reply with _id and other fields
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in replyToPost:', err.message);
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const following = user.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in getFeedPosts:', err.message);
  }
};

export const deleteReplyToPost = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    const userId = req.user._id;

    // Find the post and verify that it exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Find the reply within the post by its ID
    const reply = post.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    // Check if the user is authorized to delete the reply
    if (reply.userId.toString() !== userId.toString()) {
      return res.status(401).json({ error: 'Unauthorized to delete reply' });
    }

    // Use $pull to remove the reply from the replies array
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { replies: { _id: replyId } } },
      { new: true },
    );

    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in deleteReplyToPost:', err.message);
  }
};

export const getUserReplies = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find posts created by the user and retrieve replies
    const posts = await Post.find({ postedBy: user._id }).select('replies');

    // Collect all replies from these posts and filter out the user's own replies
    const allReplies = posts.reduce((acc, post) => {
      const filteredReplies = post.replies.filter(
        (reply) => reply.userId.toString() !== user._id.toString(),
      );
      return acc.concat(filteredReplies);
    }, []);

    res.status(200).json(allReplies);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in getUserReplies:', err.message);
  }
};
