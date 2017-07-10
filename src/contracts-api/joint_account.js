/**
 * Create a joint account where any member can make a payment.
 * ALL members are required to make a change to the member list.
 */

class JointAccount {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  async create({members, signingKey}) {
    const signingKeypair = this.sdk.Keypair.fromSecret(signingKey)
    const signingAccount = await this.server.loadAccount(
      signingKeypair.publicKey()
    )

    const Operation = this.sdk.Operation
    const txBuilder = new this.sdk.TransactionBuilder(signingAccount)

    txBuilder.addOperation(
      Operation.setOptions({
        masterWeight: 1,
        lowThreshold: 0,
        medThreshold: 0,
        highThreshold: members.length,
      })
    )

    members.forEach(acc => {
      console.log(`ACC: ${acc}`)
      if (acc === signingKeypair.publicKey()) {
        console.log(`skipping ${acc}`)
        return
      }
      txBuilder.addOperation(
        Operation.setOptions({signer: {ed25519PublicKey: acc, weight: 1}})
      )
    })

    const tx = txBuilder.build()
    tx.sign(signingKeypair)

    return this.server.submitTransaction(tx).then(res => res).catch(err => {
      console.error(JSON.stringify(err))
      throw new Error(err)
    })
  }
}

export default JointAccount
