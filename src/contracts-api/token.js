/**
 * Tokens on stellar as described in the blog post: https://www.stellar.org/blog/tokens-on-stellar/
 */

const createAccountOperation = (sdk, publicKey) => {
  const startingBalance = '100'
  const operation = sdk.Operation.createAccount({
    destination: publicKey,
    startingBalance: startingBalance,
  })
  return operation
}

const createTokenAccounts = (
  sdk,
  server,
  signingAccount,
  signingKeypair,
  issuingAccountKey,
  distAccountKey
) => {
  const txBuilder = new sdk.TransactionBuilder(signingAccount)

  let issuing
  if (!issuingAccountKey) {
    issuing = sdk.Keypair.random()
    txBuilder.addOperation(createAccountOperation(sdk, issuing.publicKey()))
  }

  let dist
  if (!distAccountKey) {
    dist = sdk.Keypair.random()
    txBuilder.addOperation(createAccountOperation(sdk, dist.publicKey()))
  }

  const tx = txBuilder.build()
  tx.sign(signingKeypair)
  return server
    .submitTransaction(tx)
    .then(res => {
      console.log(
        `issueKeypair: ${issuing && issuing.secret()} distKeypair: ${dist &&
          dist.secret()}`
      )
      return {
        issuing,
        dist,
      }
    })
    .catch(err => {
      console.error(JSON.stringify(err))
      throw new Error(err)
    })
}

const trustIssuingAccount = async (
  sdk,
  server,
  issuingAccountKeypair,
  distAccountKeypair,
  assetCode,
  numOfTokens
) => {
  const opts = {
    asset: new sdk.Asset(assetCode, issuingAccountKeypair.publicKey()),
    limit: String(numOfTokens), // trust for the full amount
  }

  const distAccount = await server.loadAccount(distAccountKeypair.publicKey())
  const txBuilder = new sdk.TransactionBuilder(distAccount)
  txBuilder.addOperation(sdk.Operation.changeTrust(opts))

  const tx = txBuilder.build()
  tx.sign(distAccountKeypair)

  return server
    .submitTransaction(tx)
    .then(res => {
      console.log(`changeTrust res=${JSON.stringify(res)}`)
      return res
    })
    .catch(err => {
      console.error(JSON.stringify(err))
      throw new Error(err)
    })
}

class Token {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  async issueToken({
    signingKey,
    assetCode,
    numOfTokens,
    limit,
    issuingAccountKey,
    distAccountKey,
  }) {
    // Create new accounts for issuing and/or distribution if not provided
    if (!issuingAccountKey || !distAccountKey) {
      const signingKeypair = this.sdk.Keypair.fromSecret(signingKey)
      const signingAccount = await this.server.loadAccount(
        signingKeypair.publicKey()
      )
      const {issuing, dist} = await createTokenAccounts(
        this.sdk,
        this.server,
        signingAccount,
        signingKeypair,
        issuingAccountKey,
        distAccountKey
      )
      if (issuing) issuingAccountKey = issuing.secret()
      if (dist) distAccountKey = dist.secret()
    }

    const issuingAccountKeypair = this.sdk.Keypair.fromSecret(issuingAccountKey)
    const distAccountKeypair = this.sdk.Keypair.fromSecret(distAccountKey)
    console.log(`issuingAccountKeypair: ${issuingAccountKeypair.publicKey()}`)
    console.log(`distAccountKeypair: ${distAccountKeypair.publicKey()}`)

    await trustIssuingAccount(
      this.sdk,
      this.server,
      issuingAccountKeypair,
      distAccountKeypair,
      assetCode,
      numOfTokens
    )

    let token

    // this.server
    //   .submitTransaction(tx)
    //   .then(res => {
    //     console.log(JSON.stringify(res))
    //     token = res
    //   })
    //   .catch(err => {
    //     console.error(JSON.stringify(err))
    //   })

    return token
  }
}

export default Token
