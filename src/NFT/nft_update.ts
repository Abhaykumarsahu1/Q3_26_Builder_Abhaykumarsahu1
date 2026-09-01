import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { mplCore, update, fetchAsset } from "@metaplex-foundation/mpl-core";
import wallet from "../../myWallet.json" with { type: "json" };
import { address } from "@solana/kit";

const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

const assetAddress = address("DXc2VM1AhLDdP6B6TSMPecJnPkhY795N3aFDwVoZqzRH");

(async () => {
    try{
        const beforeUpdate = await fetchAsset(umi, assetAddress);
        console.log("Before update name:", beforeUpdate.name, " uri:", beforeUpdate.uri);

        const tx = await update(umi, {
            asset: beforeUpdate, //passing the asset
            name : "GTR part2",
            uri: " https://gateway.irys.xyz/7ey9WnxqM5MuyUJVRwy7b2rYr6mbjFReq6D8edmTA18t" //updated metadata uri
        }).sendAndConfirm(umi);

        console.log("Update transaction signature:", tx.signature.toString());
    }catch (error) {
    console.log("error", error);
  }
})();
