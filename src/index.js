import express from 'express'
import { register, Counter } from 'prom-client'

export default class PrometheusExtension {
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
        labelNames: ['error']
      })
    }

  }

  requestDidStart(o) {
    this.counters.requests.inc({ error: false })
  }
}
