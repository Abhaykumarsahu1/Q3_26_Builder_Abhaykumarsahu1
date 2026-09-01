import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

import wallet from "../../myWallet.json" with {type : "json"};

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

(async () => {
  try {
    //change image path
    const image = await readFile("./image.png");

    //change the image name 
    const file = createGenericFile(image, "image.png", {
    contentType: "image/png"
});

    const [myUri] = await umi.uploader.upload([file]);
    console.log("Your image URI: ", myUri);

  } catch (error) {
    console.log(error);
  }
})();
umi.use(signerIdentity(signer));