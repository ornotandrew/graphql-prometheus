import { ApolloServer, gql } from 'apollo-server'
import GraphQLPrometheus from '../index'

const books = [
  {
    id: 1,
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    metadata: {
      published: '1998-07-02'
    }
  },
  {
    id: 2,
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    metadata: {
      published: () => { throw new Error('no publish date') }
    }
  },
]

const typeDefs = gql`
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
`

const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find(book => book.id == id)
  }
}

const metrics = new GraphQLPrometheus()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  extensions: [() => metrics.extension()]
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
