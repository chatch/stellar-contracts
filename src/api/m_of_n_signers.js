/**
 * Create or setup existing account with M of N signers scheme.
 */

class MofNSigners {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  async create({
    members,
    signingKey,
    numSignersLow,
    numSignersMed,
    numSignersHigh,
  }) {
    const signingKeypair = this.sdk.Keypair.fromSecret(signingKey)
    const signingAccount = await this.server.loadAccount(
      signingKeypair.publicKey()
    )

    const Operation = this.sdk.Operation
    const txBuilder = new this.sdk.TransactionBuilder(signingAccount)

    // Add signers operations
    members.forEach(acc => {
      if (acc !== signingKeypair.publicKey())
        txBuilder.addOperation(
          Operation.setOptions({signer: {ed25519PublicKey: acc, weight: 1}})
        )
    })

    // Set Thresholds
    const numOrN = numSigners => (numSigners ? numSigners : members.length)
    txBuilder.addOperation(
      Operation.setOptions({
        masterWeight: 1,
        numSignersLow: numOrN(numSignersLow),
        numSignersMed: numOrN(numSignersMed),
        numSignersHigh: numOrN(numSignersHigh),
      })
    )

    const tx = txBuilder.build()
    tx.sign(signingKeypair)

    return this.server.submitTransaction(tx).then(res => res).catch(err => {
      console.error(JSON.stringify(err))
      throw new Error(err)
    })
  }
}

export default MofNSigners
