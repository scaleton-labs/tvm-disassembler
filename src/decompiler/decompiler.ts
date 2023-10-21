import { Cell } from '@ton/core';
import { loadOpcode } from '../codepage/loadOpcode';
import { OpCode } from '../codepage/opcodes.gen';
import { Maybe } from '../utils/maybe';
import { subslice } from '../utils/subcell';

export type DecompiledInstruction = {
  op: OpCode;
  hash: string;
  offset: number;
  length: number;
};

export function decompile(args: {
  src: Cell;
  offset?: Maybe<{ bits: number; refs: number }>;
  limit?: Maybe<{ bits: number; refs: number }>;
}): DecompiledInstruction[] {
  let result: DecompiledInstruction[] = [];
  let source: Cell = args.src;
  let hash = source.hash().toString('hex');

  // Prepare offset
  let bitsDelta = 0;
  let refsDelta = 0;
  if (args.offset) {
    bitsDelta = args.offset.bits;
    refsDelta = args.offset.refs;
  }

  // Prepare offset
  let bitsLimit = args.limit ? args.limit.bits : source.bits.length - bitsDelta;
  let refsLimit = args.limit ? args.limit.refs : source.refs.length - refsDelta;
  let slice = subslice({
    cell: source,
    offsetBits: bitsDelta,
    offsetRefs: refsDelta,
    bits: bitsLimit,
    refs: refsLimit,
  });

  while (slice.remainingBits > 0) {
    // Load opcode
    const opcodeOffset = slice.offsetBits;
    const opcode = loadOpcode(slice, source);
    const opcodeLength = slice.offsetBits - opcodeOffset;

    // Failed case
    if (!opcode.ok) {
      throw Error('Unknown opcode: b' + opcode.read);
    }

    // Push opcode to result
    result.push({
      op: opcode.read,
      hash,
      offset: opcodeOffset,
      length: opcodeLength,
    });

    // Implicit jump
    if (slice.remainingBits === 0 && slice.remainingRefs > 0) {
      source = slice.loadRef();
      hash = source.hash().toString('hex');
      slice = source.beginParse();
    }
  }

  return result;
}
