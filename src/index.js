import express from 'express'
import { register, Counter } from 'prom-client'

function joinPath (path) {
   return path.prev === undefined ? path.key : `${joinPath(path.prev)}.${path.key}`
}

export default class GraphQLPrometheus {
  constructor(port = 9000) {
    const server = express()
    server.get('/metrics', (req, res) => {
      res.set('Content-Type', register.contentType)
      res.end(register.metrics())
    })
    server.listen(port, () => console.log(`Prometheus metrics at http://localhost:${port}/metrics`))

    this.counters = {
      requests: new Counter({
        name: 'graphql_requests_total',
        help: 'Total count of graphql requests',
        labelNames: ['error', 'operation_name']
      }),
      nodes: new Counter({
        name: 'graphql_request_path_total',
        help: 'Total count of graphql requests, by query path',
        labelNames: ['error', 'node', 'error_node']
      })
    }
  }

  extension() {
    return new PrometheusExtension(this.counters)
  }
}

export class PrometheusExtension {
  constructor(counters) {
    this.counters = counters

    this.nodes = {}
  }

  requestDidStart({ parsedQuery, operationName }) {
    this.operationName = operationName
  }

  willResolveField(source, args, context, info) {
    this.nodes[joinPath(info.path)] = `${info.parentType}.${info.path.key}`
  }

  willSendResponse({ graphqlResponse, context }) {
    // global request metric
    const labels = { error: !!graphqlResponse.errors }
    if (this.operationName) {
      labels.operation_name = this.operationName
    }
    this.counters.requests.inc(labels)

    // individual node metrics
    const errorPaths = graphqlResponse.errors ? graphqlResponse.errors.map(err => err.path.join('.')) : []
    Object.entries(this.nodes).map(([path, key]) => this.counters.nodes.inc({
      node: key,
      error: errorPaths.includes(path)
    }))
  }
}
