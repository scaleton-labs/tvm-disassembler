# TVM Disassembler

Evolution of [tvm-disassembler](https://github.com/ton-community/disassembler) library that is built to be used also as a library that returns structured code.
Has a list of typed opcodes and ability to read individual opcode from a slice.

## Installation

```bash
yarn add @scaleton/tvm-disassembler
```

## Basic Usage

```typescript
import { Cell } from '@ton/core';
import { decompileAll, AssemblerWriter } from '@scaleton/tvm-disassembler';

const code = Cell.fromBase64('...');
const ast = decompileAll(code); // Build AST
const assembler = AssemblerWriter.write(ast); // Generate assembler from AST 
```

## License

![MIT License](https://img.shields.io/badge/License-MIT-green)
