import {
    MsgSend,
    PrivateKey,
    createTransaction,
    TxRaw,
    ChainGrpcAuthApi,
    ChainGrpcTendermintApi,
    TxGrpcApi
  } from '@injectivelabs/sdk-ts';
  import {
    DEFAULT_STD_FEE,
    DEFAULT_BLOCK_TIMEOUT_HEIGHT,
    BigNumberInBase,
  } from '@injectivelabs/utils'
  import { ChainId } from '@injectivelabs/ts-types'
  import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
    
  // inj1cv27h0ut5taxgnnyeyt9sumv48umlpam7kzdcl
  //const mnemonic = "arrow very brush inmate media nose spider athlete off trouble expand other razor digital unit shock number fiber hood armor reflect truck whisper region";
  
  // inj16ehkkgjtftcfpzue6lr630xegymurfsrcukdjz  
  const mnemonic = "west ignore wave design acid garbage put behave old kind easily twist final fine ignore office punch buddy voyage interest sea party often modify";

export async function buildTx() {
    const privateKey = PrivateKey.fromMnemonic(mnemonic);
    const injectiveAddress = privateKey.toBech32();
    const address = privateKey.toAddress();
    console.log(`address: ${address.address}`);
    const pubKey = privateKey.toPublicKey().toBase64();
    const chainId = ChainId.Testnet;
    const amount = {
      amount: new BigNumberInBase(0.01).toWei().toFixed(),
      denom: 'inj',
    };
    
    const endpoints = getNetworkEndpoints(Network.Testnet);
    const chainGrpcAuthApi = new ChainGrpcAuthApi(endpoints.grpc);
    
    const accountDetailsResponse = await chainGrpcAuthApi.fetchAccount(injectiveAddress);

    const baseAccount =  accountDetailsResponse.baseAccount;    
    const tendermintApi = new ChainGrpcTendermintApi(endpoints.grpc);
    const latestBlock = await tendermintApi.fetchLatestBlock();

    /** Block Details */
    const latestHeight = latestBlock.header.height
    const timeoutHeight = new BigNumberInBase(latestHeight).plus(
      DEFAULT_BLOCK_TIMEOUT_HEIGHT,
    )
    
    /** Preparing the transaction */
    const msg = MsgSend.fromJSON({
      amount,
      srcInjectiveAddress: injectiveAddress,
      dstInjectiveAddress: 'inj1cv27h0ut5taxgnnyeyt9sumv48umlpam7kzdcl',
    })
    
    /** Prepare the Transaction **/
    const { txRaw, signBytes } = createTransaction({
      pubKey,
      chainId,
      fee: DEFAULT_STD_FEE,
      message: msg,
      sequence: baseAccount.sequence,
      timeoutHeight: timeoutHeight.toNumber(),
      accountNumber: baseAccount.accountNumber,
    });

    return { txRaw, signBytes}; 
}

async function broadcast(txRaw: TxRaw, signature: Uint8Array<ArrayBufferLike>) {
    const network = getNetworkEndpoints(Network.Testnet);
    txRaw.signatures = [signature];

    const t = new TxGrpcApi(network.grpc);
    const response = await t.broadcast(txRaw);
    return response;
}

async function main() {
    const { txRaw, signBytes } = await buildTx();
    const privateKey = PrivateKey.fromMnemonic(mnemonic);
    const signature = await privateKey.sign(Buffer.from(signBytes));
    const response = await broadcast(txRaw, signature);
    console.log(response);
}

main().catch(console.error);
