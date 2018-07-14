/**
 * Create a joint account where any member can make a payment.
 * ALL members are required to make a change to the member list.
 */

import {accountExists, keypairReadable, stampMemo} from '../utils'

// TODO pull this from the latest ledger
const BASE_RESERVE = 10

class JointAccount {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  async create(props) {
    //console.log(`create() props: ${JSON.stringify(props)}`)
    const {accountSecret, members, signerSecret, thresholds} = props

    const accountKeypair = this.sdk.Keypair.fromSecret(accountSecret)

    const tx = await this.buildTransaction(
      accountKeypair,
      members,
      signerSecret,
      thresholds
    )

    const txResponse = await this.server
      .submitTransaction(tx)
      .then(res => res)
      .catch(err => {
        console.error(`Failed in create joint account tx:`)
        console.error(err)
        return Promise.rejected(err)
      })

    const jointAccountDetails = await this.server.loadAccount(
      accountKeypair.publicKey()
    )

    return Promise.resolve({
      jointAccount: {
        keys: keypairReadable(accountKeypair),
        signers: jointAccountDetails.signers,
        thresholds: jointAccountDetails.thresholds,
      },
      transactions: {create: txResponse},
      inputs: props,
    })
  }

  async buildTransaction(accountKeypair, members, signerSecret, thresholds) {
    const Operation = this.sdk.Operation
    const signerKeypair = this.sdk.Keypair.fromSecret(signerSecret)
    const signerAccount = await this.server.loadAccount(
      signerKeypair.publicKey()
    )
    const txBuilder = new this.sdk.TransactionBuilder(signerAccount)

    // check if the joint account exists - if not a create_account op is needed to generate it
    if (!(await accountExists(accountKeypair.publicKey(), this.server))) {
      // see https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance
      const startBal = BASE_RESERVE * (members.length + 2)
      txBuilder.addOperation(
        Operation.createAccount({
          destination: accountKeypair.publicKey(),
          startingBalance: String(startBal),
        })
      )
    }

    // Add signerSecret operations
    members.forEach(({publicKey, weight}) => {
      if (publicKey !== signerAccount.accountId()) {
        txBuilder.addOperation(
          Operation.setOptions({
            signer: {ed25519PublicKey: publicKey, weight: weight},
            source: accountKeypair.publicKey(),
          })
        )
      }
    })

    // Set Thresholds
    txBuilder.addOperation(
      Operation.setOptions(
        Object.assign({source: accountKeypair.publicKey()}, thresholds)
      )
    )

    // Add stamp
    txBuilder.addMemo(stampMemo())

    // Sign and return
    const tx = txBuilder.build()
    tx.sign(signerKeypair, accountKeypair)
    return tx
  }
}

export default JointAccount
