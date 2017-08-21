/**
 * Setup a ROSCA Rotated Savings club given a list of members and ROSCA
 * parameters.
 */

import {
  accountExists,
  fetchBaseReserve,
  minAccountBalance,
  keypairReadable,
  stampMemo,
} from '../utils'

class ROSCARotatedSavings {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  create(props) {
    console.log(`create() props: ${JSON.stringify(props)}`)
    const roscaKeypair = this.sdk.Keypair.random()
    return this.validateInput(props)
      .then(() => this.buildTransaction({...props, roscaKeypair: roscaKeypair}))
      .then(tx => this.server.submitTransaction(tx))
      .then(txResponse => {
        return {
          roscaAccount: keypairReadable(roscaKeypair),
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
      // check all members have trustline to the asset issuer with minimum limit
      const memberAccounts = await Promise.all(
        members.map(member => this.server.loadAccount(member))
      )
      memberAccounts.forEach(account => {
        const assetCodeMatch = account.balances.filter(
          bal =>
            bal['asset_code'] === assetCode &&
            bal['asset_issuer'] === assetIssuer
        )
        if (assetCodeMatch.length === 0) {
          errors.push(
            `Member ${account.id} does not have a trustline to the asset code/issuer pair`
          )
        } else if (assetCodeMatch.limit < depositAmount) {
          errors.push(
            `Member ${account.id} has trustline but limit is below the required daily deposit amount`
          )
        }
      })
    }

    return errors.length > 0
      ? Promise.reject(new Error(JSON.stringify(errors)))
      : Promise.resolve({})
  }

  async buildTransaction({
    assetCode,
    assetIssuer,
    depositAmount,
    members,
    roscaKeypair,
    signerSecret,
    startDate,
  }) {
    const signerKeypair = this.sdk.Keypair.fromSecret(signerSecret)
    const signerAccount = await this.server.loadAccount(
      signerKeypair.publicKey()
    )

    const txBuilder = new this.sdk.TransactionBuilder(signerAccount)
    const Operation = this.sdk.Operation

    //
    // Create ROSCA account - main collector and payout account
    //

    const startBalance = minAccountBalance(
      members.length,
      await fetchBaseReserve(this.server)
    )
    txBuilder.addOperation(
      Operation.createAccount({
        destination: roscaKeypair.publicKey(),
        startingBalance: String(startBalance),
      })
    )

    //
    // Add members as signers
    //

    members.forEach(account => {
      txBuilder.addOperation(
        Operation.setOptions({
          signer: {ed25519PublicKey: account, weight: 1},
          source: roscaKeypair.publicKey(),
        })
      )
    })

    //
    // Trust the issuer deposits payments can be received
    //

    const asset = new this.sdk.Asset(assetCode, assetIssuer)
    const limit = members.length * depositAmount // trust for up to the daily payout amount
    txBuilder.addOperation(
      Operation.changeTrust({
        asset: asset,
        limit: String(limit),
      })
    )

    // Add data key value for new contract
    //  AND add this to all contracts ......
    //  AND have the wallet look it up on startup or signer signin

    // Add stamp
    txBuilder.addMemo(stampMemo())

    // Sign and return
    const tx = txBuilder.build()
    tx.sign(signerKeypair)
    tx.sign(roscaKeypair)
    return tx
  }
}

export default ROSCARotatedSavings
