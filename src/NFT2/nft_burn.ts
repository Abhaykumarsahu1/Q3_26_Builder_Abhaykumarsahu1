import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { mplCore, burn, fetchAsset } from "@metaplex-foundation/mpl-core";
import wallet from "../../myWallet.json" with { type: "json" };
import { base58 } from "@metaplex-foundation/umi/serializers";

const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

const assetAddress = publicKey("9Bw2n1GYUdHTK8EEz2SQPHR72xfUettuHc7GPnqJkFR6");

(async () => {
    try{
        const prevBalance = await umi.rpc.getBalance(signer.publicKey);
        console.log("Wallet balance before burn:", Number(prevBalance.basisPoints) / 1e9, "SOL");

        const asset = await fetchAsset(umi, assetAddress);
        const tx = await burn(umi, {
            asset,
        }).sendAndConfirm(umi);
        console.log("Burn transaction signature:", base58.deserialize(tx.signature)[0]);

        const afterBalance = await umi.rpc.getBalance(signer.publicKey);
        console.log("Wallet balance after burn:", Number(afterBalance.basisPoints) / 1e9, "SOL");

        await fetchAsset(umi, assetAddress);
      console.log("Asset still exists but burn may have failed");
    }catch(error){
        console.log("error",error);
    }
})();