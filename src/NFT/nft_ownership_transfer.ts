import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
  generateSigner,
} from "@metaplex-foundation/umi";
import { transfer, mplCore, fetchAsset } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

import wallet from "../../myWallet.json" with { type: "json" };
import { before } from "node:test";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

//this is my current owner keypair
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

//i need to hv the asset address as public key to transfer the address authority to new owner
    const assetAddress = publicKey("DXc2VM1AhLDdP6B6TSMPecJnPkhY795N3aFDwVoZqzRH");

(async () =>{
    try{
        //generating the new wallet to recieve the nft
        const newOwner = generateSigner(umi);
        console.log("New owner wallet:", newOwner.publicKey.toString());

        //fetching the asset before transfering it to newOwner
        const beforeTransfer = await fetchAsset(umi, assetAddress);
        console.log("Owner before transfer:", beforeTransfer.owner.toString());

        const tx = await transfer(umi, {
            asset: beforeTransfer,
            newOwner: newOwner.publicKey,

        }).sendAndConfirm(umi);

        console.log("Transfer transaction signature:", tx.signature.toString());

    }catch (error) {
    console.error("Transfer failed:", error);
  }
})();

