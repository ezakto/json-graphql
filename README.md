# json-graphql

Write and parse GraphQL queries in pure JSON

## Install

```
npm install json-graphql
```

## Usage

```
import { parse, stringify } from 'json-graphql';

const graphql = `...`;
console.log(parse(graphql)); // Shows object

const json = {...};
console.log(stringify(json)); // Shows graphql
```

## Example

GraphQL query

```
{
  human: hooman(id: "1000") {
    name
    height(unit: "FOOT")
  }
}
```

JSON query

```
{
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
  }
}
```

## Methods

### parse(string query)

Takes a GraphQL query string and returns a JSON object

### stringify(object query)

Takes a JSON query and returns a GraphQL query string
