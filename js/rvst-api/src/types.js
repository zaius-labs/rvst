/**
 * @typedef {{ name: string, type: string, repeated: boolean, optional: boolean }} Field
 * @typedef {{ name: string, fields: Field[] }} MessageDef
 * @typedef {{ name: string, requestType: string, responseType: string, native: boolean }} CommandDef
 * @typedef {{ name: string, protoPath: string, address: string }} GrpcDef
 * @typedef {{ file: string, messages: MessageDef[], commands: CommandDef[], grpcConnections: GrpcDef[] }} ApiSchema
 */

// Type definitions only — no runtime code needed.
// Using JSDoc for types since this runs in plain Node, not TypeScript.
export {};
