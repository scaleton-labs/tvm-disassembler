import {DebugSymbols} from '@scaleton/func-debug-symbols';
import {Writer} from '../utils/Writer';
import {
  BlockNode,
  InstructionNode,
  MethodNode,
  NodeType,
  ProcedureNode,
  ProgramNode,
} from '../ast';

export class AssemblerWriter {
  #writer = new Writer();

  readonly knownGlobals = new Map<number, string>();
  readonly knownMethods = new Map<number, string>();
  readonly knownProcedures = new Map<string, string>();

  constructor(debugSymbols: DebugSymbols) {
    debugSymbols.globals.forEach((glob) => {
      this.knownGlobals.set(glob.index, glob.name);
    });

    debugSymbols.procedures.forEach((proc) => {
      this.knownMethods.set(proc.methodId, proc.name);
      this.knownProcedures.set(proc.cellHash, proc.name);
    });
  }

  protected resolveGlobalName(index: number) {
    return this.knownGlobals.get(index) ?? `${index}`;
  }

  protected resolveMethodName(methodId: number) {
    return this.knownMethods.get(methodId) ?? `?fun_${methodId}`;
  }

  protected resolveProcedureName(hash: string) {
    return (
      this.knownProcedures.get(hash) ?? `?fun_ref_${hash.substring(0, 16)}`
    );
  }

  writeProgramNode(node: ProgramNode) {
    this.#writer.writeLine('PROGRAM{');
    this.#writer.indent(() => {
      // Sort
      const methods = [...node.methods].sort((a, b) => a.id - b.id);
      const procedures = [...node.procedures].sort((a, b) =>
        a.hash.localeCompare(b.hash),
      );

      methods.forEach((method) => {
        this.#writer.writeLine(
          `DECLPROC ${this.resolveMethodName(method.id)};`,
        );
      });

      procedures.forEach((procedure) => {
        this.#writer.writeLine(
          `DECLPROC ${this.resolveProcedureName(procedure.hash)}`,
        );
      });

      methods.forEach((method) => this.writeMethodNode(method));
      procedures.forEach((procedure) => this.writeNode(procedure));
    });
    this.#writer.writeLine('}END>c');
  }

  writeMethodNode(node: MethodNode) {
    const methodName = this.resolveMethodName(node.id);

    this.#writer.write(`${methodName} PROC:`);
    this.writeBlockNode(node.body);
    this.#writer.newLine();
  }

  writeProcedureNode(node: ProcedureNode) {
    const procedureName = this.resolveProcedureName(node.hash);

    this.#writer.write(`${procedureName} PROCREF:`);
    this.writeBlockNode(node.body);
    this.#writer.newLine();
  }

  writeBlockNode(node: BlockNode) {
    this.#writer.writeLine('<{');
    this.#writer.indent(() => {
      for (const instruction of node.instructions) {
        this.writeInstructionNode(instruction);
      }
    });
    this.#writer.write('}>');
  }

  writeInstructionNode(node: InstructionNode) {
    node.arguments.forEach((arg) => {
      switch (arg.type) {
        case NodeType.STACK_ENTRY:
          this.#writer.write(`s${arg.value} `);
          break;

        case NodeType.CONTROL_REGISTER:
          this.#writer.write(`c${arg.value} `);
          break;

        case NodeType.SCALAR:
          this.#writer.write(`${arg.value} `);
          break;

        case NodeType.REFERENCE:
          this.#writer.write(`${this.resolveProcedureName(arg.hash)} `);
          break;

        case NodeType.GLOBAL_VARIABLE:
          this.#writer.write(`${this.resolveGlobalName(arg.value)} `);
          break;

        case NodeType.METHOD_REFERENCE:
          this.#writer.write(`${this.resolveMethodName(arg.methodId)} `);
          break;

        case NodeType.BLOCK:
          this.writeBlockNode(arg);
          this.#writer.write(' ');
          break;
      }
    });

    this.#writer.writeLine(node.opcode);
  }

  writeNode(
    node:
      | ProgramNode
      | MethodNode
      | ProcedureNode
      | BlockNode
      | InstructionNode,
  ) {
    switch (node.type) {
      case NodeType.PROGRAM:
        this.writeProgramNode(node);
        break;

      case NodeType.METHOD:
        this.writeMethodNode(node);
        break;

      case NodeType.PROCEDURE:
        this.writeProcedureNode(node);
        break;

      case NodeType.BLOCK:
        this.writeBlockNode(node);
        break;

      case NodeType.INSTRUCTION:
        this.writeInstructionNode(node);
        break;
    }
  }

  output() {
    return this.#writer.end();
  }

  static write(
    node: ProgramNode | MethodNode | ProcedureNode | BlockNode,
    debugSymbols?: DebugSymbols,
  ): string {
    const writer = new AssemblerWriter(
      debugSymbols ?? {
        globals: [],
        procedures: [],
      },
    );

    writer.writeNode(node);

    return writer.output();
  }
}
