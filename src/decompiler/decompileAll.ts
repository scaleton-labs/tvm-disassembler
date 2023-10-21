import { Cell, Dictionary, DictionaryValue } from '@ton/core';
import { decompile } from './decompiler';
import {
  AST,
  BlockNode,
  InstructionNode,
  MethodNode,
  ProcedureNode,
  ProgramNode,
  ScalarNode,
} from '../ast';
import { subcell } from '../utils/subcell';

function decompileCell(args: {
  root: boolean;
  source: Cell;
  offset: { bits: number; refs: number };
  limit: { bits: number; refs: number } | null;
  registerRef?: (ref: Cell) => void;
}): ProgramNode | BlockNode {
  const opcodes = decompile({
    src: args.source,
    offset: args.offset,
    limit: args.limit,
  });

  // Check if we have a default opcodes of func output
  if (
    args.root &&
    opcodes.length === 4 &&
    opcodes[0].op.code === 'SETCP0' &&
    opcodes[1].op.code === 'DICTPUSHCONST' &&
    opcodes[2].op.code === 'DICTIGETJMPZ' &&
    opcodes[3].op.code === 'THROWARG'
  ) {
    // Load dictionary
    let dictKeyLen = opcodes[1].op.args[0];
    let dictCell = opcodes[1].op.args[1];
    let dict = Dictionary.loadDirect<number, { offset: number; cell: Cell }>(
      Dictionary.Keys.Int(dictKeyLen),
      createCodeCell(),
      dictCell,
    );

    const procedures: ProcedureNode[] = [];

    // Extract all methods
    const registeredCells = new Set<string>();
    const registerCell = (cell: Cell) => {
      const cellHash = cell.hash().toString('hex');

      if (registeredCells.has(cellHash)) return;

      procedures.push(
        AST.procedure(
          cellHash,
          decompileCell({
            root: false,
            source: cell,
            offset: {
              bits: 0,
              refs: 0,
            },
            limit: null,
            registerRef: registerCell,
          }) as BlockNode,
        ),
      );

      registeredCells.add(cellHash);
    };

    const methods = [...dict].map(
      ([methodId, methodCell]): MethodNode =>
        AST.method(
          methodId,
          decompileCell({
            root: false,
            source: methodCell.cell,
            offset: {
              bits: methodCell.offset,
              refs: 0,
            },
            limit: null,
            registerRef: registerCell,
          }) as BlockNode,
          methodCell.cell.hash().toString('hex'),
          methodCell.offset,
        ),
    );

    return AST.program(methods, procedures);
  }

  const instructions: InstructionNode[] = opcodes.map((op): InstructionNode => {
    const opcode = op.op;

    // Special cases for call refs
    switch (opcode.code) {
      case 'CALLREF':
        if (args.registerRef) {
          args.registerRef(opcode.args[0]);
        }

        return AST.instruction(
          'INLINECALLDICT' as any,
          [AST.reference(opcode.args[0].hash().toString('hex'))],
          op.offset,
          op.length,
          op.hash,
        );

      case 'PUSHCONT':
        return AST.instruction(
          opcode.code,
          [
            decompileCell({
              source: opcode.args[0],
              offset: { bits: opcode.args[1], refs: opcode.args[2] },
              limit: { bits: opcode.args[3], refs: opcode.args[4] },
              root: false,
              registerRef: args.registerRef,
            }) as BlockNode,
          ],
          op.offset,
          op.length,
          op.hash,
        );

      // Slices
      case 'PUSHSLICE':
      case 'STSLICECONST':
        const slice = subcell({
          cell: opcode.args[0],
          offsetBits: opcode.args[1],
          offsetRefs: opcode.args[2],
          bits: opcode.args[3],
          refs: opcode.args[4],
        });

        return AST.instruction(
          opcode.code,
          [AST.scalar(slice.toString())],
          op.offset,
          op.length,
          op.hash,
        );

      // Special cases for continuations
      case 'IFREFELSE':
      case 'CALLREF':
      case 'IFJMPREF':
      case 'IFREF':
      case 'IFNOTREF':
      case 'IFNOTJMPREF':
      case 'IFREFELSEREF':
      case 'IFELSEREF':
      case 'PUSHREFCONT':
        return AST.instruction(
          opcode.code,
          [
            decompileCell({
              root: false,
              source: opcode.args[0],
              offset: {
                bits: 0,
                refs: 0,
              },
              limit: null,
              registerRef: args.registerRef,
            }) as BlockNode,
          ],
          op.offset,
          op.length,
          op.hash,
        );

      // Globals
      case 'SETGLOB':
      case 'GETGLOB':
        return AST.instruction(
          opcode.code,
          [AST.globalVariable(opcode.args[0])],
          op.offset,
          op.length,
          op.hash,
        );

      // Control Registers
      case 'POPCTR':
      case 'PUSHCTR':
        return AST.instruction(
          opcode.code === 'POPCTR' ? 'POP' : 'PUSH',
          [AST.controlRegister(opcode.args[0])],
          op.offset,
          op.length,
          op.hash,
        );

      // Stack Primitives
      case 'POP':
      case 'PUSH':
        return AST.instruction(
          opcode.code,
          [AST.stackEntry(opcode.args[0])],
          op.offset,
          op.length,
          op.hash,
        );

      // OPCODE s(i) s(j)
      case 'XCHG':
      case 'XCHG2':
      case 'XCPU':
      case 'PUXC':
      case 'PUSH2':
        return AST.instruction(
          opcode.code,
          [AST.stackEntry(opcode.args[0]), AST.stackEntry(opcode.args[1])],
          op.offset,
          op.length,
          op.hash,
        );

      // OPCODE s(i) s(j) s(k)
      case 'XCHG3':
      case 'PUSH3':
      case 'XC2PU':
      case 'XCPUXC':
      case 'XCPU2':
      case 'PUXC2':
      case 'PUXCPU':
      case 'PU2XC':
        return AST.instruction(
          opcode.code,
          [
            AST.stackEntry(opcode.args[0]),
            AST.stackEntry(opcode.args[1]),
            AST.stackEntry(opcode.args[2]),
          ],
          op.offset,
          op.length,
          op.hash,
        );

      // All remaining opcodes
      default:
        return AST.instruction(
          opcode.code,
          'args' in opcode
            ? opcode.args.map((arg): ScalarNode => AST.scalar(arg as any))
            : [],
          op.offset,
          op.length,
          op.hash,
        );
    }
  });

  return AST.block(instructions);
}

export function decompileAll(source: Cell) {
  return decompileCell({
    source: source,
    offset: { bits: 0, refs: 0 },
    limit: null,
    root: true,
  });
}

function createCodeCell(): DictionaryValue<{ offset: number; cell: Cell }> {
  return {
    serialize: (src, builder) => {
      throw Error('Not implemented');
    },
    parse: (src) => {
      let cloned = src.clone(true);
      let offset = src.offsetBits;
      return { offset, cell: cloned.asCell() };
    },
  };
}
