import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

//Importing my wallet first
import wallet from "../../myWallet.json" with {type : "json"};

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

(async () => {
  try {
    //i m the signer here
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

    //generating a new mint signer for address
    const mint = await generateKeyPairSigner();

    //getting the size of the mint account
    const space = BigInt(getMintSize());

    //get the minimum balance for rent- exemption
    const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

    const {value: latestBlockhash} = await rpc.getLatestBlockhash().send();

    //this will confirm my signed transaction in onchain
    const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

    const msg = createTransactionMessage({version:0});
    const msgWithPayer =  setTransactionMessageFeePayerSigner(signer,msg);
    const msgWithLiftime = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, msgWithPayer);

    const txMessage = appendTransactionMessageInstructions([
      //this instruction has a payer 
      getCreateAccountInstruction({
        payer: signer,
        newAccount: mint,
        lamports: rent,
        space,
        programAddress : TOKEN_PROGRAM_ADDRESS,
      }),
      getInitializeMintInstruction({
        mint: mint.address,
        decimals: 6,
        mintAuthority : signer.address,
      }),
    ], msgWithLiftime);

    const signedTx = await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    const signature = getSignatureFromTransaction(signedTx);

    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log(
      `mint address: ${mint.address}. Transaction Signature: ${signature}`,
    );
  } catch (error) {
    console.log(error);
  }
})();
