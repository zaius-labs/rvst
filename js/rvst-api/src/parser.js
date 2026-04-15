import ts from 'typescript';

/**
 * Parse a .svelte.ts file and extract API schema definitions.
 * @param {string} filename
 * @param {string} code
 * @returns {import('./types.js').ApiSchema}
 */
export function parseApiSchema(filename, code) {
  const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);

  /** @type {import('./types.js').MessageDef[]} */
  const messages = [];
  /** @type {import('./types.js').CommandDef[]} */
  const commands = [];
  /** @type {import('./types.js').GrpcDef[]} */
  const grpcConnections = [];

  ts.forEachChild(sourceFile, (node) => {
    // Export interface → MessageDef
    if (ts.isInterfaceDeclaration(node) && hasExportModifier(node)) {
      messages.push(extractMessage(node, code));
    }

    // Export variable statements: command() or grpc()
    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const decl of node.declarationList.declarations) {
        if (!decl.initializer || !ts.isCallExpression(decl.initializer)) continue;
        const call = decl.initializer;
        const calleeName = call.expression.getText(sourceFile);
        const varName = decl.name.getText(sourceFile);

        if (calleeName === 'command') {
          commands.push(extractCommand(varName, call, code));
        } else if (calleeName === 'grpc') {
          grpcConnections.push(extractGrpc(varName, call, sourceFile));
        }
      }
    }
  });

  return { file: filename, messages, commands, grpcConnections };
}

/**
 * @param {ts.Node} node
 * @returns {boolean}
 */
function hasExportModifier(node) {
  if (!ts.canHaveModifiers(node)) return false;
  const mods = ts.getModifiers(node);
  return mods ? mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) : false;
}

/**
 * @param {ts.InterfaceDeclaration} node
 * @param {string} code
 * @returns {import('./types.js').MessageDef}
 */
function extractMessage(node, code) {
  /** @type {import('./types.js').Field[]} */
  const fields = [];

  for (const member of node.members) {
    if (!ts.isPropertySignature(member) || !member.type) continue;

    const name = member.name.getText();
    const optional = !!member.questionToken;
    let repeated = false;
    let type;

    if (ts.isArrayTypeNode(member.type)) {
      repeated = true;
      type = code.substring(member.type.elementType.pos, member.type.elementType.end).trim();
    } else {
      type = code.substring(member.type.pos, member.type.end).trim();
    }

    fields.push({ name, type, repeated, optional });
  }

  return { name: node.name.text, fields };
}

/**
 * @param {string} name
 * @param {ts.CallExpression} call
 * @param {string} code
 * @returns {import('./types.js').CommandDef}
 */
function extractCommand(name, call, code) {
  let requestType = '';
  let responseType = '';
  let native = false;

  // Extract type arguments: command<Req, Res>()
  if (call.typeArguments && call.typeArguments.length >= 2) {
    requestType = code.substring(call.typeArguments[0].pos, call.typeArguments[0].end).trim();
    responseType = code.substring(call.typeArguments[1].pos, call.typeArguments[1].end).trim();
  }

  // Check for { native: true } argument
  if (call.arguments.length > 0) {
    const arg = call.arguments[0];
    if (ts.isObjectLiteralExpression(arg)) {
      for (const prop of arg.properties) {
        if (
          ts.isPropertyAssignment(prop) &&
          prop.name.getText() === 'native' &&
          prop.initializer.kind === ts.SyntaxKind.TrueKeyword
        ) {
          native = true;
        }
      }
    }
  }

  return { name, requestType, responseType, native };
}

/**
 * @param {string} name
 * @param {ts.CallExpression} call
 * @param {ts.SourceFile} sourceFile
 * @returns {import('./types.js').GrpcDef}
 */
function extractGrpc(name, call, sourceFile) {
  let protoPath = '';
  let address = '';

  if (call.arguments.length >= 1 && ts.isStringLiteral(call.arguments[0])) {
    protoPath = call.arguments[0].text;
  }
  if (call.arguments.length >= 2 && ts.isStringLiteral(call.arguments[1])) {
    address = call.arguments[1].text;
  }

  return { name, protoPath, address };
}
