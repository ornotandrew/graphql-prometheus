"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.PrometheusExtension = exports.default = void 0;var _express = _interopRequireDefault(require("express"));
var _promClient = require("prom-client");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function joinPath(path) {
  return path.prev === undefined ? path.key : `${joinPath(path.prev)}.${path.key}`;
}

class GraphQLPrometheus {
  constructor(port = 9000) {
    const server = (0, _express.default)();
    server.get('/metrics', (req, res) => {
      res.set('Content-Type', _promClient.register.contentType);
      res.end(_promClient.register.metrics());
    });
    server.listen(port, () => console.log(`Prometheus metrics at http://localhost:${port}/metrics`));

    this.counters = {
      requests: new _promClient.Counter({
        name: 'graphql_requests_total',
        help: 'Total count of graphql requests',
        labelNames: ['error', 'operation_name'] }),

      nodes: new _promClient.Counter({
        name: 'graphql_request_path_total',
        help: 'Total count of graphql requests, by query path',
        labelNames: ['error', 'node', 'error_node'] }) };


  }

  extension() {
    return new PrometheusExtension(this.counters);
  }}exports.default = GraphQLPrometheus;


class PrometheusExtension {
  constructor(counters) {
    this.counters = counters;

    this.nodes = {};
  }

  requestDidStart({ parsedQuery, operationName }) {
    this.operationName = operationName;
  }

  willResolveField(source, args, context, info) {
    this.nodes[joinPath(info.path)] = `${info.parentType}.${info.path.key}`;
  }

  willSendResponse({ graphqlResponse, context }) {
    // global request metric
    const labels = { error: !!graphqlResponse.errors };
    if (this.operationName) {
      labels.operation_name = this.operationName;
    }
    this.counters.requests.inc(labels);

    // individual node metrics
    console.log('nodes:', this.nodes);
    const errorPaths = graphqlResponse.errors ? graphqlResponse.errors.map(err => err.path.join('.')) : [];
    Object.entries(this.nodes).map(([path, key]) => this.counters.nodes.inc({
      node: key,
      error: errorPaths.includes(path) }));

  }}exports.PrometheusExtension = PrometheusExtension;