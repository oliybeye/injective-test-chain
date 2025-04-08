import { Bip39, Random } from "@cosmjs/crypto";
import { getEthereumAddress, PrivateKey } from "@injectivelabs/sdk-ts";

export function generateMnemonic(): string {
    return Bip39.encode(Random.getBytes(32)).toString();
}

export async function generateCosmosAccountFromSeed(mnemonic?: string) {
    if (!mnemonic) {
        mnemonic = generateMnemonic();
        console.log(`Generated mnemonic: ${mnemonic}`);
    }

  try {
    const privateKey = PrivateKey.fromMnemonic(mnemonic);
    const account = privateKey.toAddress();

    return {
      mnemonic,
      ethAddress: getEthereumAddress(account.address),
      address: account.address,
      privateKey: privateKey.toPrivateKeyHex().length,
    };
  } catch (error: any) {
    throw new Error(`Error generating Cosmos account: ${error.message}`);
  }
}

// address: inj12sc4g8gf3v4szq88m5t6s65drtcgxt6naw3frq
export const mnemonic1 = "arrow very brush inmate media nose spider athlete off trouble expand other razor digital unit shock number fiber hood armor reflect truck whisper region";

const mnemonic = "west ignore wave design acid garbage put behave old kind easily twist final fine ignore office punch buddy voyage interest sea party often modify";
generateCosmosAccountFromSeed(mnemonic).then(obj => console.log(`result: ${JSON.stringify(obj, null, 2)}`)).catch(err => console.error(err));
