"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _express = _interopRequireDefault(require("express"));
var _promClient = require("prom-client");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class PrometheusExtension {
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
        labelNames: ['error'] }) };



  }

  requestDidStart(o) {
    this.counters.requests.inc({ error: false });
  }}exports.default = PrometheusExtension;