'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.stringify = stringify;
exports.parse = parse;
var argsToken = /&(\d+)$/;
var argsMatch = /(?:\:\s*(\w+)\s*)?\((.+?)\)/g;

function indent(n) {
  var ret = '';
  for (var i = 0; i < n; i++) {
    ret += '  ';
  }
  return ret;
}

function parseValue(key, value) {
  var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  if (key === '$' || !value) return '';

  var graphql = indent(level) + key;

  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
    if ('$' in value) {
      var args = value['$'];

      delete value['$'];

      if ('_' in args) {
        graphql += ': ' + args._;

        delete args._;
      }

      graphql += '(';
      graphql += Object.keys(args).map(function (arg) {
        return arg + ': ' + JSON.stringify(args[arg]);
      }).join(', ');
      graphql += ')';
    }

    var attrs = Object.keys(value);

    if (attrs.length) {
      graphql += ' {\n';

      attrs.forEach(function (attr) {
        graphql += parseValue(attr, value[attr], level + 1);
      });

      graphql += indent(level) + '}';
    }
  }

  graphql += '\n';

  return graphql;
}

function empty2bool(object) {
  if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') return object;

  var keys = Object.keys(object);

  if (keys.length) {
    keys.forEach(function (key) {
      return object[key] = empty2bool(object[key]);
    });
  } else {
    return true;
  }

  return object;
}

function stringify(json) {
  var graphql = '{\n';

  Object.keys(json).forEach(function (key) {
    graphql += parseValue(key, JSON.parse(JSON.stringify(json[key])));
  });

  graphql += '}';

  return graphql;
}

function parse(graphql) {
  var json = {};
  var args = [];
  var stack = [];
  var last = json;

  graphql.replace(argsMatch, function (str, alias, argstr) {
    var object = {};

    if (alias) {
      object._ = alias;
    }

    argstr.split(/\s*,\s*/).forEach(function (pair) {
      var _pair$split = pair.split(/\s*:\s*/),
          _pair$split2 = _slicedToArray(_pair$split, 2),
          key = _pair$split2[0],
          value = _pair$split2[1];

      object[key] = JSON.parse(value);
    });

    return '&' + (args.push(object) - 1);
  }).split(/,?\s+/).forEach(function (token) {
    var object = stack[stack.length - 1];

    if (token === '{') {
      stack.push(last);
      return;
    }

    if (token === '}') {
      stack.pop();
      return;
    }

    var matchArgs = token.match(argsToken);

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
