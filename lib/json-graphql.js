const argsToken = /&(\d+)$/;
const argsMatch = /(?:\:\s*(\w+)\s*)?\((.+?)\)/g;

function indent(n) {
  let ret = '';
  for (let i = 0; i < n; i++) {
    ret += '  ';
  }
  return ret;
}

function parseValue(key, value, level = 1) {
  if (key === '$' || !value) return '';

  let graphql = indent(level) + key;

  if (typeof value === 'object') {
    if ('$' in value) {
      const args = value['$'];

      delete value['$'];

      if ('_' in args) {
        graphql += `: ${args._}`;

        delete args._;
      }

      graphql += '(';
      graphql += Object.keys(args).map(arg => {
        return `${arg}: ${JSON.stringify(args[arg])}`;
      }).join(', ');
      graphql += ')';
    }

    const attrs = Object.keys(value);

    if (attrs.length) {
      graphql += ' {\n';

      attrs.forEach(attr => {
        graphql += parseValue(attr, value[attr], level + 1);
      });

      graphql += indent(level) + '}';
    }
  }

  graphql += '\n';

  return graphql;
}

function empty2bool(object) {
  if (typeof object !== 'object') return object;

  const keys = Object.keys(object);

  if (keys.length) {
    keys.forEach(key => object[key] = empty2bool(object[key]));
  } else {
    return true;
  }

  return object;
}

export function stringify(json) {
  let graphql = '{\n';

  Object.keys(json).forEach(key => {
    graphql += parseValue(key, JSON.parse(JSON.stringify(json[key])));
  });

  graphql += '}';

  return graphql;
}

export function parse(graphql) {
  const json = {};
  const args = [];
  const stack = [];
  let last = json;

  graphql
    .replace(argsMatch, (str, alias, argstr) => {
      const object = {};

      if (alias) {
        object._ = alias;
      }

      argstr
        .split(/\s*,\s*/)
        .forEach(pair => {
          const [key, value] = pair.split(/\s*:\s*/);
          object[key] = JSON.parse(value);
        });

      return `&${args.push(object) - 1}`;
    })
    .split(/,?\s+/)
    .forEach(token => {
      const object = stack[stack.length - 1];

      if (token === '{') {
        stack.push(last);
        return;
      }

      if (token === '}') {
        stack.pop();
        return;
      }

      const matchArgs = token.match(argsToken);

      if (matchArgs) {
        last = object[token.replace(matchArgs[0], '')] = {
          '$': args[+matchArgs[1]]
        };
      } else {
        last = object[token] = {};
      }
    });

  return empty2bool(json);
}
