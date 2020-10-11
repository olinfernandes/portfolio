const express = require('express');
const router = express.Router();
const bCrypt = require('bcryptjs');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLID,
  GraphQLList,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql');

const { PubSub, GraphQLServer } = require('graphql-yoga');
const pubsub = new PubSub();

const { User, Post, Comment } = require('../bin/models.js');

// Generates hash using bCrypt
const createHash = (password) => {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
};

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    role: { type: GraphQLString },
    posts: {
      type: new GraphQLList(PostType),
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => Post.find({ userId: parent._id }),
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve: (parent, arg) => Comment.find({ email: parent.email }),
    },
  }),
});
const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    _id: { type: GraphQLID },
    title: { type: new GraphQLNonNull(GraphQLString) },
    body: { type: new GraphQLNonNull(GraphQLString) },
    user: {
      type: UserType,
      resolve: (parent, args) => User.findById(parent.userId),
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve: (parent, args) => Comment.find({ postId: parent._id }),
    },
  }),
});
const CommentType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    _id: { type: GraphQLID },
    body: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    post: {
      type: PostType,
      resolve: (parent, args) => Post.findById(parent.postId),
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: async (parent, args) => await User.find({}),
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => await User.findById(args.id),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, args) => await Post.find({}),
    },
    post: {
      type: PostType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => await Post.findById(args.id),
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve: async () => await Comment.find({}),
    },
    comment: {
      type: CommentType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => await Comment.findById(args.id),
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: new GraphQLList(UserType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) =>
        await new User({ ...args, password: createHash(args.password) }).save(),
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        role: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const { name, email, password, role } = args;
        const options = {};
        if (name) Object.assign(options, { name });
        if (email) Object.assign(options, { email });
        if (password)
          Object.assign(options, { password: createHash(password) });
        if (role) Object.assign(options, { role });
        return await User.findByIdAndUpdate(args.id, options, { new: true });
      },
    },
    deleteUser: {
      type: new GraphQLList(UserType),
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        await User.findByIdAndDelete(args.id);
        return await User.find({});
      },
    },
    addPost: {
      type: new GraphQLList(PostType),
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        body: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const newPost = await new Post({ ...args }).save();
        // pubsub.publish('postList', { post: newPost });
        return await Post.find({});
      },
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        body: { type: GraphQLString },
      },
      resolve: async (parent, args) =>
        await Post.findByIdAndUpdate(
          args.id,
          {
            title: args.title,
            userId: args.userId,
            body: args.body,
          },
          { new: true },
          (err, res) => {
            if (err) return err;
            // pubsub.publish('postList', { post: res });
            return res;
          }
        ),
    },
    deletePost: {
      type: new GraphQLList(PostType),
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        await Post.findByIdAndDelete(args.id);
        return await Post.find({});
      },
    },
    addComment: {
      type: new GraphQLList(CommentType),
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        await new Comment({ ...args }).save();
        return await Comment.find({ postId: args.postId });
      },
    },
    updateComment: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) =>
        await Comment.findByIdAndUpdate(
          args.id,
          {
            body: args.body,
            name: args.name,
            email: args.email,
          },
          { new: true },
          async (err, comment) => await Post.findById(comment.postId)
        ),
    },
    deleteComment: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) =>
        await Comment.findByIdAndDelete(
          args.id,
          async (err, comment) => await Post.findById(comment.postId)
        ),
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

const typeDefs = `
  type PostData {
    _id: ID!
    title: String!
    body: String!
  }
  type UserData {
    _id: ID!
    name: String!
    email: String!
    role: String
  }
  type CommentData {
    _id: ID!
    body: String!

  }
  type RootQuery {
    userList: [UserData!]!
    postList: [PostData!]!
  }
  type Subscription {
    user: UserData!
    post: PostData!
  }
  schema {
    query: RootQuery
    subscription: Subscription
  }
`;
const resolvers = {
  RootQuery: {
    userList: async (parent, args, ctx, info) => await User.find({}),
    postList: async (parent, args, ctx, info) => await Post.find({}),
  },
  Subscription: {
    user: {
      resolve: async (parent, args, ctx, info) => await User.find({}),
      subscribe: (parent, args, ctx, info) => pubsub.asyncIterator('userList'),
    },
    post: {
      resolve: async (parent, args, ctx, info) => await Post.find({}),
      subscribe: (parent, args, ctx, info) => pubsub.asyncIterator('postList'),
    },
  },
};

const server = new GraphQLServer({
  resolvers,
  typeDefs,
});
server.start((res) =>
  console.log(`Subscriptions listening on Port ${res.port}`)
);
router.use(
  '/',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

module.exports = router;
