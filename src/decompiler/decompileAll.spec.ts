import { decompileAll } from './decompileAll';
import * as fs from 'fs';
import type { DebugSymbols } from '@scaleton/func-debug-symbols';
import { Cell } from '@ton/core';
import { AssemblerWriter } from '../printer/AssemblerWriter';

describe('decompileAll', () => {
  const debugSymbols: DebugSymbols = {
    globals: [],
    procedures: [
      {
        methodId: -1,
        name: 'recv_external',
        cellHash: '',
      },
      {
        methodId: 0,
        name: 'recv_internal',
        cellHash: '',
      },
      {
        methodId: 76407,
        name: 'is_plugin_installed',
        cellHash: '',
      },
      {
        methodId: 78748,
        name: 'get_public_key',
        cellHash: '',
      },
      {
        methodId: 81467,
        name: 'get_subwallet_id',
        cellHash: '',
      },
      {
        methodId: 85143,
        name: 'seqno',
        cellHash: '',
      },
      {
        methodId: 107653,
        name: 'get_plugin_list',
        cellHash: '',
      },
      {
        methodId: 113617,
        name: 'supported_interfaces',
        cellHash: '',
      },
    ],
  };

  it('should decompile wallet v1', () => {
    const wallet = Cell.fromBase64(
      'te6cckEBAQEARAAAhP8AIN2k8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVEH98Ik=',
    );

    const ast = decompileAll(wallet);
    const result = AssemblerWriter.write(ast, debugSymbols);

    expect(result).toMatchSnapshot();
  });

  it('should decompile wallet v2', () => {
    const wallet = Cell.fromBase64(
      'te6cckEBAQEAVwAAqv8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VShNwu2',
    );

    const ast = decompileAll(wallet);
    const result = AssemblerWriter.write(ast, debugSymbols);

    expect(result).toMatchSnapshot();
  });

  it('should decompile wallet v3', () => {
    const wallet = Cell.fromBase64(
      'te6cckEBAQEAcQAA3v8AIN0gggFMl7ohggEznLqxn3Gw7UTQ0x/THzHXC//jBOCk8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVBC9ba0=',
    );

    const ast = decompileAll(wallet);
    const result = AssemblerWriter.write(ast, debugSymbols);

    expect(result).toMatchSnapshot();
  });

  it('should decompile wallet v4', () => {
    const wallet = Cell.fromBase64(
      'te6ccgECFAEAAtQAART/APSkE/S88sgLAQIBIAIDAgFIBAUE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8QERITAubQAdDTAyFxsJJfBOAi10nBIJJfBOAC0x8hghBwbHVnvSKCEGRzdHK9sJJfBeAD+kAwIPpEAcjKB8v/ydDtRNCBAUDXIfQEMFyBAQj0Cm+hMbOSXwfgBdM/yCWCEHBsdWe6kjgw4w0DghBkc3RyupJfBuMNBgcCASAICQB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAKCwBZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f+YN4EoAbeBAUiYcVnzGEAgFYDA0AEbjJftRNDXCx+AA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIA4PABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVA==',
    );

    const ast = decompileAll(wallet);
    const result = AssemblerWriter.write(ast, debugSymbols);

    expect(result).toMatchSnapshot();
  });

  it('should decompile highload wallet', () => {
    let wallet = Cell.fromBase64(
      'te6ccgEBCAEAlwABFP8A9KQT9LzyyAsBAgEgAgMCAUgEBQC48oMI1xgg0x/TH9MfAvgju/Jj7UTQ0x/TH9P/0VEyuvKhUUS68qIE+QFUEFX5EPKj9ATR+AB/jhYhgBD0eG+lIJgC0wfUMAH7AJEy4gGz5lsBpMjLH8sfy//J7VQABNAwAgFIBgcAF7s5ztRNDTPzHXC/+AARuMl+1E0NcLH4',
    );

    const ast = decompileAll(wallet);
    const result = AssemblerWriter.write(ast, debugSymbols);

    expect(result).toMatchSnapshot();
  });

  it('should decompile wallet v4 speedtest', () => {
    const wallet = Cell.fromBase64(
      'te6ccgECFAEAAtQAART/APSkE/S88sgLAQIBIAIDAgFIBAUE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8QERITAubQAdDTAyFxsJJfBOAi10nBIJJfBOAC0x8hghBwbHVnvSKCEGRzdHK9sJJfBeAD+kAwIPpEAcjKB8v/ydDtRNCBAUDXIfQEMFyBAQj0Cm+hMbOSXwfgBdM/yCWCEHBsdWe6kjgw4w0DghBkc3RyupJfBuMNBgcCASAICQB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAKCwBZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f+YN4EoAbeBAUiYcVnzGEAgFYDA0AEbjJftRNDXCx+AA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIA4PABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVA==',
    );

    performance.mark('decompileAll');
    for (let i = 0; i < 100; i++) {
      decompileAll(wallet);
    }

    const measurement = performance.measure('decompileAll', 'decompileAll');
    console.log('disassembled 100 contracts in', measurement.duration);
  });

  it('should decompile echo', () => {
    const wallet = Cell.fromBoc(
      fs.readFileSync(__dirname + '/__testdata__/echo_Echo.code.boc'),
    )[0];

    const ast = decompileAll(wallet);
    const result = AssemblerWriter.write(ast, {
      globals: [
        {
          index: 1,
          name: '__tact_context',
        },
        {
          index: 2,
          name: '__tact_context_sender',
        },
        {
          index: 3,
          name: '__tact_context_sys',
        },
        {
          index: 4,
          name: '__tact_randomized',
        },
      ],
      procedures: [
        {
          methodId: 0,
          name: 'recv_internal',
          cellHash: '',
        },
        {
          methodId: 113617,
          name: 'supported_interfaces',
          cellHash: '',
        },
        {
          methodId: 115554,
          name: '%hello',
          cellHash: '',
        },
        {
          methodId: 1,
          name: '$global_reply',
          cellHash:
            '05a658b0b82d492fde2aa8199d9484cad9e808339f8a6eb60854eb160f1bec28',
        },
        {
          methodId: 1,
          name: '$global_send',
          cellHash:
            '3301d2d6bbf180a4c5aefeedf317da9a118b911f87013b50c81c19331c43f055',
        },
        {
          methodId: 1,
          name: '$Echo$_contract_init',
          cellHash:
            'dca7aba6e712f2dd825a4f2e3edc16103ad10b13fa61e9c65e9fb504d63959b5',
        },
        {
          methodId: 1,
          name: '$Echo$_contract_router',
          cellHash:
            'f5ca007f3e3441812650c74480f6e8ca73bb2432518c8df3b9cb3c3f4858efc4',
        },
        {
          methodId: 1,
          name: '$String$_fun_asComment',
          cellHash:
            '7b0b7ac68163f54510779a54743192916874ee1c4d8e7f17fbc4c018d9dc1054',
        },
        {
          methodId: 1,
          name: '$Slice$_fun_asCell',
          cellHash:
            '3ee8ad4bdf5992980c7af7529ef57bbc4d6e47ba2d756fba61400afe59b81ced',
        },
        {
          methodId: 1,
          name: '$Echo$_fun_hello',
          cellHash:
            'fc8ae1407928bf8b0d0a366fe95a5ca47d7a8e5533ce34bfbc727f95aaef82d4',
        },
        {
          methodId: 1,
          name: '__tact_string_builder_append',
          cellHash:
            'a2813468f47d741c2d44377014a11fbdd0146ffb0229a435b75590b2178e7a86',
        },
      ],
    });

    expect(result).toMatchSnapshot();
  });

  it('should decompile wallet', () => {
    const wallet = Cell.fromBoc(
      fs.readFileSync(__dirname + '/__testdata__/wallet_Wallet.code.boc'),
    )[0];

    const ast = decompileAll(wallet);
    const result = AssemblerWriter.write(ast, debugSymbols);

    expect(result).toMatchSnapshot();
  });

  it('should decompile wallet (AST)', () => {
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };

    const wallet = Cell.fromBoc(
      fs.readFileSync(__dirname + '/__testdata__/wallet_Wallet.code.boc'),
    )[0];

    const ast = decompileAll(wallet);

    expect(ast).toMatchSnapshot();
  });

  it('should decompile division operations', () => {
    const code = Cell.fromBase64(
      'te6ccgEBBAEAZAABFP8A9KQT9LzyyAsBAgFiAgMABtDyCgCVoNzQ61II61II61IK61IM61IRBhNSGGEGE1IaYQYTUhxg61JK61JM7utTCO7rUwru61MM51NoAOdTagDnU2wA6kFTiOpBU4rqQVON',
    );
    const ast = decompileAll(code);
    const result = AssemblerWriter.write(ast);

    expect(result).toMatchSnapshot();
  });
});
