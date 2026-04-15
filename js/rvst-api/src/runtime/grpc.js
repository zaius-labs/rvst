/**
 * Define a gRPC connection to an external service.
 * V1: stub that stores config. Actual gRPC transport via tonic is v2.
 */
export function grpc(protoPath, address) {
  return new Proxy({}, {
    get(_, method) {
      return async (payload) => {
        if (globalThis.__host?.grpc_call) {
          const result = globalThis.__host.grpc_call(address, method, JSON.stringify(payload));
          return JSON.parse(result);
        }
        throw new Error(`gRPC not available: ${address}/${method} — native gRPC transport is not yet implemented`);
      };
    }
  });
}
