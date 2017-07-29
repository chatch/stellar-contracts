/**
 * Create a joint account where any member can make a payment.
 * ALL members are required to make a change to the member list.
 */

class JointAccount {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  async create(props) {
    console.log(`create() props: ${JSON.stringify(props)}`)

    const {members, signer} = props
    const signingKeypair = this.sdk.Keypair.fromSecret(signer)
    const signingAccount = await this.server.loadAccount(
      signingKeypair.publicKey()
    )

    const Operation = this.sdk.Operation
    const txBuilder = new this.sdk.TransactionBuilder(signingAccount)

    // Add signer operations
    members.forEach(acc => {
      if (acc !== signingKeypair.publicKey())
        txBuilder.addOperation(
          Operation.setOptions({signer: {ed25519PublicKey: acc, weight: 1}})
        )
    })

    // Set Thresholds
    txBuilder.addOperation(
      Operation.setOptions({
        masterWeight: 1,
        lowThreshold: 0,
        medThreshold: 0,
        highThreshold: members.length,
      })
    )

    const tx = txBuilder.build()
    tx.sign(signingKeypair)

    const txResponse = await this.server
      .submitTransaction(tx)
      .then(res => res)
      .catch(err => {
        console.error(`Failed in create joint account tx:`)
        console.error(err)
        throw new Error(err)
      })

    const jointAccountDetails = await this.server.loadAccount('xxx')

    return {
      jointAccount: jointAccountDetails,
      transactions: {createJointAccount: txResponse},
      inputs: props,
    }
  }
}

export default JointAccount
