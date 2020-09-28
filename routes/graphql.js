const express = require('express');
const router = express.Router();
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLID,
  GraphQLList,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql');
const { User, Post, Comment } = require('../bin/models.js');

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
      resolve: (parent, args) => User.find({}),
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => User.findById(args.id),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (parent, args) => Post.find({}),
    },
    post: {
      type: PostType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => Post.findById(args.id),
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve: () => Comment.find({}),
    },
    comment: {
      type: CommentType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => Comment.findById(args.id),
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
      resolve: (parent, args) => new User({ ...args }).save(),
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) =>
        User.findByIdAndUpdate(args.id, {
          name: args.name,
          email: args.email,
          password: args.password,
        }),
    },
    deleteUser: {
      type: new GraphQLList(UserType),
      args: {
        id: { type: GraphQLID },
      },
      resolve: (parent, args) =>
        User.findByIdAndDelete(args.id).then(() => User.find({})),
    },
    addPost: {
      type: PostType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => new Post({ ...args }),
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: GraphQLString },
      },
      resolve: (parent, args) =>
        Post.findByIdAndUpdate(args.id, {
          title: args.title,
          userId: args.userId,
          body: args.body,
        }),
    },
    deletePost: {
      type: new GraphQLList(PostType),
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: (parent, args) =>
        Post.findByIdAndDelete(args.id).then(() => Post.find({})),
    },
    addComment: {
      type: PostType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve: (parent, args) =>
        new Comment({ ...args }).save().then(() => Post.findById(args.postId)),
    },
    updateComment: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve: (parent, args) =>
        Comment.findByIdAndUpdate(args.id, {
          body: args.body,
          name: args.name,
          email: args.email,
        }).then((comment) => Post.findById(comment.postId)),
    },
    deleteComment: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) =>
        Comment.findByIdAndDelete(args.id).then((comment) =>
          Post.findById(comment.postId)
        ),
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

router.use(
  '/',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

module.exports = router;
