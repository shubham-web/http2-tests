"use strict";

const fs = require("fs");
const path = require("path");
const fastify = require("fastify")({
  http2: true,
  https: {
    key: fs.readFileSync(
      path.join(__dirname, "..", "keys", "localhost-privkey.pem")
    ),
    cert: fs.readFileSync(
      path.join(__dirname, "..", "keys", "localhost-cert.pem")
    ),
  },
});

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
});

fastify.listen({ port: 4002 }, () => {
  console.log("Listening on :4002");
});
