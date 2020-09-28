const { connect, model, Schema } = require('mongoose');

const dbUrl = 'localhost/Portfolio';

connect(`mongodb://${dbUrl}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})
  .then(() =>
    console.log(
      'Connected to mongodb2\nGarphiql -> http://localhost:3000/gql\n'
    )
  )
  .catch((error) => console.log(error));

const User = model(
  'User',
  new Schema({
    name: { type: String, default: null, index: true },
    email: { type: String, default: null, index: true },
    password: { type: String, required: true },
    role: { type: String, default: 'USER', index: true },
  })
);
const Post = model(
  'Post',
  new Schema({
    title: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    body: { type: String, default: null },
    comments: { type: [String], default: [] },
  })
);
const Comment = model(
  'Comment',
  new Schema({
    postId: { type: String, required: true, index: true },
    body: { type: String, required: true },
    name: { type: String, default: null },
    email: { type: String, default: null },
  })
);

module.exports = { User, Post, Comment };
