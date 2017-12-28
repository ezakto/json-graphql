const JGRAPHQL = require('./dist/json-graphql.js');

const graphql = `{
  human: hooman(id: "1000") {
    name
    height(unit: "FOOT")
  }
  cat {
    name
    weight
  }
}`;

const json = {
  "human": {
    "$": {
      "_": "hooman",
      "id": "1000"
    },
    "name": true,
    "height": {
      "$": {
        "unit": "FOOT",
      }
    }
  },
  "cat": {
    "name": true,
    "weight": true
  }
};

console.log('Parse:', JSON.stringify(json) === JSON.stringify(JGRAPHQL.parse(graphql)));
console.log('Stringify:', JGRAPHQL.stringify(json) === graphql);
