
const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user_id })
          .select('-__v -password')
          .populate('savedBooks');
        return userData;
      }
      throw new AuthenticationError('You are not logged in!')
    },

  },

  Mutation: {
    addUser: async (parent, args ) => {
      const user = await User.create(args)
      const token = signToken(user)
      return {user, token}

      return ( token, user);
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if(!user){
        throw new AuthenticationError('Incorrect email address!')
      }
      const userPassword = await user.isCorrectPassword(password)
      if(!userPassword){
        throw new AuthenticationError('Incorrect password!')
      }
      const token = signToken(user);
      return {token, user};
    },

    
    saveBook: async (parent, { bookData}, context) => {
      if (context.user){
        const updatedUser = await User.findByIdAndUpdate(
          {_id: context.user_id}, 
          {$push: {savedBook: bookData}}, 
          {new: true}
        )
        return updatedUser
      }
      throw new AuthenticationError('User is not logged in!')
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user){
        const updatedUser = await User.findByIdAndUpdate(
          {_id: context.user_id}, 
          {$pull: {savedBooks: bookId}}, 
          {new: true}
        ).populate('savedBooks');

        return updatedUser
      }
      throw new AuthenticationError('No book with this id!')
    },


  }
};

module.exports = resolvers;


