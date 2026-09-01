import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../myWallet.json" with {type : "json"};
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

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

umi.use(signerIdentity(signer));

(async () => {
  try {
    const image = "https://gateway.irys.xyz/82cpkcbcsNxeKvErJtMU9E3SobyKw3HnGmP4ynyowrUD";
    const metadata = {
      name: "Rugging the UPDATED gene",
      symbol: "GTR",
      description: "It's not a normal UPDATED generug",
      image,
      attributes: [
        { trait_type: "Background", value: "Blue" },
        { trait_type: "Rarity", value: "Rare" },
      ],
      properties: {
        files: [{ uri: image, type: "image/png" }],
        category: "image",
      },
    };
    const myUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${myUri}`);
  } catch (error) {
    console.log("error", error);
  }
})();