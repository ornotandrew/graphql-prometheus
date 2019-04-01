"use strict";var _apolloServer = require("apollo-server");
var _index = _interopRequireDefault(require("../index"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const books = [
{
  id: 1,
  title: 'Harry Potter and the Chamber of Secrets',
  author: 'J.K. Rowling',
  metadata: {
    published: '1998-07-02' } },


{
  id: 2,
  title: 'Jurassic Park',
  author: 'Michael Crichton',
  metadata: {
    published: () => {throw new Error('no publish date');} } }];




const typeDefs = _apolloServer.gql`
  type Query {
    books: [Book!]
    book(id: ID!): Book!
  }
  type Book {
    title: String!
    author: String!
    metadata: BookMetadata!
  }
  type BookMetadata {
    published: String
  }
`;

const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find(book => book.id == id) } };



const metrics = new _index.default();

const server = new _apolloServer.ApolloServer({
  typeDefs,
  resolvers,
  extensions: [() => metrics.extension()] });


server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});