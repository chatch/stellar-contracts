/**
 * Setup a ROSCA Rotated Savings club given a list of members and ROSCA
 * parameters.
 */

import {accountExists, keypairReadable, stampMemo} from '../utils'

class ROSCARotatedSavings {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  create(props) {
    console.log(`create() props: ${JSON.stringify(props)}`)
    return this.validateInput(props)
      .then(() => this.buildTransaction(props))
      .then(tx => this.server.submitTransaction(tx))
      .then(txResponse => {
        return {
          transactions: {create: txResponse},
          inputs: props,
        }
      })
  }

  async validateInput({
    assetCode,
    assetIssuer,
    depositAmount,
    members,
    signerSecret,
    startDate,
  }) {
    const errors = []
    if ((await accountExists(assetIssuer, this.server)) === false) {
      errors.push(`Provided asset issuer does not exist on the network`)
    } else {
      const issuerAccount = await this.server.loadAccount(assetIssuer)
      const assetCodeMatch = issuerAccount.balances.filter(
        bal => bal['asset_code'] === assetCode
      )
      if (assetCodeMatch.length === 0)
        errors.push(`Provided asset issuer is not an issuer of ${assetCode}`)
    }
    // TODO: else if (not an issuer for assetCode ..... )

    return errors.length > 0
      ? Promise.reject(new Error(JSON.stringify(errors)))
      : Promise.resolve({})
  }

  async buildTransaction({
    assetCode,
    assetIssuer,
    depositAmount,
    members,
    signerSecret,
    startDate,
  }) {
    const Operation = this.sdk.Operation
    const signerKeypair = this.sdk.Keypair.fromSecret(signerSecret)
    const signerAccount = await this.server.loadAccount(
      signerKeypair.publicKey()
    )
    const txBuilder = new this.sdk.TransactionBuilder(signerAccount)

    // Add signerSecret operations
    members.forEach(({account, weight}) => {
      if (account !== signerAccount.accountId()) {
        txBuilder.addOperation(
          Operation.setOptions({
            signer: {ed25519PublicKey: account, weight: weight},
            //source: accountKeypair.publicKey(),
          })
        )
      }
    })

    // Add stamp
    txBuilder.addMemo(stampMemo())

    // Sign and return
    const tx = txBuilder.build()
    tx.sign(signerKeypair)
    return tx
  }
}

export default ROSCARotatedSavings
