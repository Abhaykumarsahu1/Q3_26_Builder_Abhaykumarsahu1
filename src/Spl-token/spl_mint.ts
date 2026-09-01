import {
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import wallet from "../../myWallet.json" with {type : "json"};
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstructionAsync,
  getMintToInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const token_decimals = 1_000_000n;

const mint  = address("HeAsenyir3cubmiAVQW7XWQWp9zaNSEDEHYf3HCQbXAU");

(async ()=>{
    try{
      const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

      //we are going to derive the pda for the ata
      const [ata] = await findAssociatedTokenPda({
        mint,
        owner : signer.address,
        tokenProgram :TOKEN_PROGRAM_ADDRESS,
      });

    console.log(`Your ata is : ${ata}`); //this is my ATA pda

    const createAtaIx = await getCreateAssociatedTokenInstructionAsync({
        mint, //what token this ata accountwill have
        payer:signer, //rentexempt like who will pay it for the creationg of this ata account
        owner:signer.address, //who will own the token inside this ata
    });

    const mintToIx = await getMintToInstruction({
        mint,
        token: ata, //now 10skyper is currently bieng minted in this ata and total supply is 10.
        mintAuthority: signer,
        amount : 10n * token_decimals,
    });

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const msg = createTransactionMessage({ version: 0 });

    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);

    const msgWithLiftime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      msgWithPayer,
    );

    const txMessage = appendTransactionMessageInstructions(
      [createAtaIx, mintToIx],
      msgWithLiftime,
    );
    
    const signedTx = await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    const signature = getSignatureFromTransaction(signedTx);

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log(`mint txid: ${signature}`);
    }catch (error) {
    console.log("error", error);
  }
})();