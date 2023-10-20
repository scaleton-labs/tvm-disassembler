# TVM Disassembler

Evolution of [tvm-disassembler](https://github.com/ton-community/disassembler) library that is built to be used also as a library that returns structured code.
Has a list of typed opcodes and ability to read individual opcode from a slice.

## Installation

```bash
yarn add @scaleton/tvm-disassembler
```

## Basic Usage

```typescript
import { Cell } from "@ton/core";
import { decompileCell, decompileAll } from "@scaleton/tvm-disassembler";

// Decompile a single cell sequence into opcode list.
// Useful for interpretators or for debugging.
const compiledCode = Cell.fromBase64('...');
const decompiledOpcodes = decompileCell({src: compiledCode});

// Decompile a whole contract. Useful for contract developers and explorers.
const decompiledCode = decompileAll({src: compiledCode});

```

## License

![MIT License](https://img.shields.io/badge/License-MIT-green)