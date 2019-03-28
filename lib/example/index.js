"use strict";var _apolloServer = require("apollo-server");
var _index = _interopRequireDefault(require("../index"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const books = [
{
  title: 'Harry Potter and the Chamber of Secrets',
  author: 'J.K. Rowling' },

{
  title: 'Jurassic Park',
  author: 'Michael Crichton' }];



const typeDefs = _apolloServer.gql`
  type Book {
    title: String
    author: String
  }
  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: () => books } };



const metrics = new _index.default();

const server = new _apolloServer.ApolloServer({
  typeDefs,
  resolvers,
  extensions: [() => metrics] });


server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});