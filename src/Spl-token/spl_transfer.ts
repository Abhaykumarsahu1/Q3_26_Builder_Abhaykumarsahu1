import {
  address,
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
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const mint = address("HeAsenyir3cubmiAVQW7XWQWp9zaNSEDEHYf3HCQbXAU");

//for now my ata is reciepnt here which will have another ata where i will transfer the token
const to = address("2qpnPucGMF4uKGhPxFQkDokbAEzKZtRcRhzhNouaeW8g");

(async () => {
  try {
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    const [fromAta] = await findAssociatedTokenPda({
        mint,
        owner: signer.address,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    const [toAta] = await findAssociatedTokenPda({
        mint,
        owner: to,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log(`Your toAta is : ${toAta}`);

    const createAtaIx = await getCreateAssociatedTokenInstructionAsync({
        mint, //this token will get transfered so this ata will also represent the sky token
      payer: signer, //payer is me 
      owner: to,
    });

    const transferTx = getTransferCheckedInstruction({
        source : fromAta,
        mint,
        destination: toAta,
        authority: signer,
        amount: 2n * 1_000_000n,
        decimals: 6,
    });

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const msg = createTransactionMessage({ version: 0 });

    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
    const msgWithLiftime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      msgWithPayer,
    );
    const txMessage = appendTransactionMessageInstructions(
      [createAtaIx, transferTx],
      msgWithLiftime,
    );

    const signedTx = await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    const signature = getSignatureFromTransaction(signedTx);

    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log(`mint txid: ${signature}`);

  }catch (error) {
    console.log(error);
  }
})();
