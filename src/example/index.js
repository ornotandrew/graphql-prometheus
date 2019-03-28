import { ApolloServer, gql } from 'apollo-server'
import PrometheusExtension from '../index'

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
]

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }
  type Query {
    books: [Book]
  }
`

const resolvers = {
  Query: {
    books: () => books
  }
}

const metrics = new PrometheusExtension()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  extensions: [() => metrics]
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
