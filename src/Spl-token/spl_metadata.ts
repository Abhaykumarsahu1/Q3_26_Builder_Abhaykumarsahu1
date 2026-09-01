import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../myWallet.json" with {type : "json"};
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import{ createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import type {
  CreateMetadataAccountV3InstructionArgs,
  CreateMetadataAccountV3InstructionAccounts,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
import { sign } from "node:crypto";

//my mint account address
const mint = publicKey("HeAsenyir3cubmiAVQW7XWQWp9zaNSEDEHYf3HCQbXAU");

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer)); 

(async ()=>{
    try{
        //creating the metadata account for mint 
       const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint, //the address
      mintAuthority: signer,
    };
    const data: DataV2Args = {
        name: "Skyper coin",
        symbol: "SKY",
        uri: "https://arweave.net/123456",
        sellerFeeBasisPoints: 1,
        creators: null,
        collection: null,
        uses: null,
    };
    const args: CreateMetadataAccountV3InstructionArgs={
        data,
        isMutable: true,
        collectionDetails: null,
    };

    const tx = createMetadataAccountV3(umi,{
        ...accounts,
        ...args
    });
    const result = await tx.sendAndConfirm(umi);
    console.log("signature: ", bs58.encode(Buffer.from(result.signature)));

    }catch (error) {
    console.log("error", error);
  }
})();