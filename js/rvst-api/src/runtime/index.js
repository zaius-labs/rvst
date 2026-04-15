import { invoke, registerHandler } from './transport.js';

// query — for read operations, returns reactive-compatible object
export function query(name, params, options = {}) {
  let data = null;
  let loading = true;
  let error = null;

  const promise = invoke(name, params, options)
    .then(result => { data = result; loading = false; })
    .catch(err => { error = err.message; loading = false; });

  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
    then: (fn) => promise.then(() => fn({ data, error })),
  };
}

// mutation — for write operations, returns callable
export function mutation(name, params, options = {}) {
  return {
    async call(overrideParams) {
      return invoke(name, overrideParams || params, options);
    }
  };
}

export { registerHandler } from './transport.js';
