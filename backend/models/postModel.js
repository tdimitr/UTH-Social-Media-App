import mongoose from 'mongoose';
import { Filter } from 'bad-words';

const filter = new Filter({ placeHolder: '*' });

const postSchema = mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      maxLength: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        userProfilePic: {
          type: String,
        },
        username: {
          type: String,
        },
        likes: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: 'User',
          default: [],
        },
      },
    ],
  },
  { timestamps: true },
);

postSchema.pre('save', function (next) {
  if (this.text) {
    this.text = filter.clean(this.text);
  }
  if (this.replies && this.replies.length > 0) {
    this.replies.forEach((reply) => {
      if (reply.text) {
        reply.text = filter.clean(reply.text);
      }
    });
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
