const { Factory, Model, Server } = require("miragejs");

const loadFixture = (fixture) => require(`./fixtures/${fixture}.json`);

exports.makeServer = function makeServer({ environment = "development" } = {}) {
  return new Server({
    environment,

    trackRequests: true,

    models: {
      block: Model,
      delegate: Model,
      lock: Model,
      peer: Model,
      round: Model,
      transaction: Model,
      vote: Model,
      wallet: Model,
    },

    factories: {
      block: Factory.extend({}),
      delegate: Factory.extend({}),
      lock: Factory.extend({}),
      peer: Factory.extend({}),
      round: Factory.extend({}),
      transaction: Factory.extend({}),
      vote: Factory.extend({}),
      wallet: Factory.extend({}),
    },

    seeds(server) {
      server.create("block", {});
      server.create("delegate", {});
      server.create("lock", {});
      server.create("peer", {});
      server.create("round", {});
      server.create("transaction", {});
      server.create("vote", {});
      server.create("wallet", {});
    },

    routes() {
      this.get("https://raw.githubusercontent.com/cauriland/common/master/mainnet/known-wallets.json", () => {
        return {
          CYix1BgbYEe93JBHEyXxenHZmRd8xmWavB: "Cauri Genesis Wallet",
        };
      });

      this.get("https://min-api.cryptocompare.com/data/price", (schema, request) => {
        if (request.queryParams.tsyms) {
          return { USD: 0.3419 };
        }

        return {
          CAU: 1,
        };
      });

      this.get("https://min-api.cryptocompare.com/data/dayAvg", (schema, request) => {
        return {
          USD: 0.3401,
          ConversionType: {
            type: "multiply",
            conversionSymbol: "BTC",
          },
        };
      });

      this.get("https://min-api.cryptocompare.com/data/histohour", (schema, request) => {
        return loadFixture("chart/day");
      });

      this.get("https://min-api.cryptocompare.com/data/histoday", (schema, request) => {
        const limit = Number(request.queryParams.limit);

        if (limit === 7) {
          return loadFixture("chart/week");
        }

        if (limit === 30) {
          return loadFixture("chart/month");
        }

        if (limit === 120) {
          return loadFixture("chart/quarter");
        }

        if (limit === 365) {
          return loadFixture("chart/year");
        }
      });

      // Cauri API
      this.urlPrefix = "https://node.cauri.cm";
      this.namespace = "api";

      let blockchainHeight = 0;
      this.get("/blockchain", (schema, request) => {
        const blockchain = loadFixture("api/blockchain");

        if (blockchainHeight) {
          blockchainHeight = blockchainHeight + 1;
        } else {
          blockchainHeight = blockchain.data.block.height + 1;
        }

        blockchain.data.block.height = blockchainHeight;

        return blockchain;
      });

      let blocksRequestedBefore = false;
      this.get("/blocks", (schema, request) => {
        const response = blocksRequestedBefore ? loadFixture("api/blocks-page-2") : loadFixture("api/blocks");

        if (!blocksRequestedBefore) {
          blocksRequestedBefore = true;
        } else {
          blocksRequestedBefore = false;
        }

        if (request.queryParams.limit) {
          response.data = response.data.slice(0, request.queryParams.limit);
        }

        if (request.queryParams.totalFee) {
          return loadFixture("api/blocks/search/by-total-fee");
        }

        if (request.queryParams.generatorPublicKey) {
          return loadFixture("api/blocks/search/by-generator-public-key");
        }

        if (request.queryParams.id) {
          return loadFixture("api/blocks/search/by-id");
        }

        return response;
      });

      this.get("/blocks/:id", (schema, request) => {
        return loadFixture(`api/blocks/${request.params.id}`);
      });

      this.get("/blocks/:id/transactions", (schema, request) => {
        return loadFixture(`api/blocks/${request.params.id}/transactions`);
      });

      this.get("/blocks/first", (schema, request) => {
        return loadFixture("api/blocks/first");
      });

      this.get("/blocks/last", (schema, request) => {
        return loadFixture("api/blocks/last");
      });

      let delegatesRequestedBefore = false;
      this.get("/delegates", (schema, request) => {
        let page = request.queryParams.page || 1;

        if (delegatesRequestedBefore && page === 1) {
          page = 2;
        }

        const response = loadFixture(`api/delegates-page-${page}`);

        if (!delegatesRequestedBefore) {
          delegatesRequestedBefore = true;
        } else {
          delegatesRequestedBefore = false;
        }

        if (request.queryParams.limit) {
          response.data = response.data.slice(0, request.queryParams.limit);
        }

        return response;
      });

      this.get("/delegates/:id", (schema, request) => {
        return loadFixture(`api/delegates/${request.params.id}`);
      });

      this.get("/delegates/:id/blocks", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/delegates/:id/voters", (schema, request) => {
        const response = loadFixture(`api/delegates/${request.params.id}/voters`);

        if (request.queryParams.limit) {
          response.data = response.data.slice(0, request.queryParams.limit);
        }

        return response;
      });

      this.get("/locks", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/locks/:id", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/locks/search", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.post("/locks/unlocked", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/node/configuration", (schema, request) => {
        return loadFixture("api/node/configuration");
      });

      this.get("/node/configuration/crypto", (schema, request) => {
        return loadFixture("api/node/configuration/crypto");
      });

      this.get("/node/fees", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/node/status", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/node/syncing", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/peers", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/peers/:ip", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/rounds/:id/delegates", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/transactions", (schema, request) => {
        let response;

        if (request.queryParams.senderId) {
          response = loadFixture(`api/wallets/${request.queryParams.senderId}/transactions/sent`);
        }

        if (request.queryParams.recipientId) {
          response = loadFixture(`api/wallets/${request.queryParams.recipientId}/transactions/received`);
        }

        response = loadFixture("api/transactions");

        if (request.queryParams.limit) {
          response.data = response.data.slice(0, request.queryParams.limit);
        }

        return response;
      });

      this.get("/transactions", (schema, request) => {
        if (request.queryParams.amount && request.queryParams.fee) {
          return loadFixture("api/transactions/search/by-amount-and-fee");
        }

        if (!request.queryParams.id) {
          return loadFixture("api/transactions/search/transactions");
        }

        if (request.queryParams.id !== "fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff") {
          return loadFixture("api/transactions/search/by-id");
        }

        return {
          meta: {},
          data: [],
        };
      });

      this.get("/transactions/:id", (schema, request) => {
        return loadFixture(`api/transactions/${request.params.id}`);
      });

      this.get("/transactions/fees", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/transactions/schemas", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/transactions/types", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/transactions/unconfirmed", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/transactions/unconfirmed/:id", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/votes", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/votes/:id", (schema, request) => {
        return {
          meta: {},
          data: [],
        };
      });

      this.get("/wallets", (schema, request) => {
        console.log("wuts");
        if (request.queryParams["attributes.vote"]) {
          return loadFixture("api/wallets/search/by-vote");
        }

        if (request.queryParams["attributes.username"]) {
          return loadFixture("api/wallets/search/by-username");
        }

        if (request.queryParams.address) {
          return loadFixture("api/wallets/search/by-address");
        }

        return {
          meta: {},
          data: [],
        };
      });

      this.get("/wallets/:id", (schema, request) => {
        return loadFixture(`api/wallets/${request.params.id}`);
      });

      this.get("/wallets/:id/locks", (schema, request) => {
        return loadFixture(`api/wallets/${request.params.id}/locks`);
      });

      this.get("/wallets/:id/transactions", (schema, request) => {
        if (request.params.senderId) {
          return loadFixture(`api/wallets/${request.params.senderId}/transactions/sent`);
        }

        if (request.params.recipientId) {
          return loadFixture(`api/wallets/${request.params.recipientId}/transactions/received`);
        }

        return loadFixture(`api/wallets/${request.params.id}/transactions`);
      });

      this.get("/wallets/:id/transactions/received", (schema, request) => {
        return loadFixture(`api/wallets/${request.params.id}/transactions/received`);
      });

      this.get("/wallets/:id/transactions/sent", (schema, request) => {
        return loadFixture(`api/wallets/${request.params.id}/transactions/sent`);
      });

      this.get("/wallets/:id/votes", (schema, request) => {
        return loadFixture(`api/wallets/${request.params.id}/votes`);
      });

      this.get("/wallets/top", (schema, request) => {
        const response = loadFixture("api/wallets/top");

        if (request.queryParams.limit) {
          response.data = response.data.slice(0, request.queryParams.limit);
        }

        return response;
      });
    },
  });
};
