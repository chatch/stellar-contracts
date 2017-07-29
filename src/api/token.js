/**
 * Issue a token on stellar as described in the blog post: https://www.stellar.org/blog/tokens-on-stellar/
 */

import {keypairReadable} from '../utils'

const loadBalances = (server, publicKey) =>
  server.loadAccount(publicKey).then(acc => {
    return acc.balances
  })

const loadThresholds = (server, publicKey) =>
  server.loadAccount(publicKey).then(acc => {
    return {thresholds: acc.thresholds, masterWeight: acc.signers[0].weight}
  })

// Generate a doc template something like the example in Step 5 of Tokens on Stellar.
// Move some of these fields to the input form if generating this is useful enough.
const docTemplate = code => {
  return {
    about:
      "Example of a doc file for a token. You could fill this out, sign and publish it to ipfs as described in Step 5 of 'Tokens on Stellar' article.",
    code: code,
    name: `${code} token`,
    description: `The ${code} token ...`,
    conditions: 'Enter some conditions of token use here ...',
  }
}

const createAccountOperation = (sdk, publicKey, startingBalance) => {
  const operation = sdk.Operation.createAccount({
    destination: publicKey,
    startingBalance: String(startingBalance), // api expects a string for the balance
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
    txBuilder.addOperation(createAccountOperation(sdk, issuing.publicKey(), 31))
  }

  let dist
  if (!distAccountKey) {
    dist = sdk.Keypair.random()
    txBuilder.addOperation(createAccountOperation(sdk, dist.publicKey(), 41))
  }

  const tx = txBuilder.build()
  tx.sign(signingKeypair)
  return server
    .submitTransaction(tx)
    .then(txResult => {
      console.log(
        `issueKeypair: ${issuing && issuing.secret()} distKeypair: ${dist &&
          dist.secret()}`
      )
      return {
        issuing,
        dist,
        txResult,
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
  distAccountKeypair,
  asset,
  numOfTokens
) => {
  const opts = {
    asset: asset,
    limit: String(numOfTokens), // trust for the full amount
  }

  const distAccount = await server.loadAccount(distAccountKeypair.publicKey())
  const txBuilder = new sdk.TransactionBuilder(distAccount)
  txBuilder.addOperation(sdk.Operation.changeTrust(opts))

  const tx = txBuilder.build()
  tx.sign(distAccountKeypair)

  return server.submitTransaction(tx).then(res => res).catch(err => {
    console.error(JSON.stringify(err))
    throw new Error(err)
  })
}

const createTokens = async (
  sdk,
  server,
  issuingAccountKeypair,
  distAccount,
  asset,
  numOfTokens
) => {
  const opts = {
    asset: asset,
    destination: distAccount,
    amount: String(numOfTokens), // trust for the full amount
  }

  const issuingAccount = await server.loadAccount(
    issuingAccountKeypair.publicKey()
  )
  const txBuilder = new sdk.TransactionBuilder(issuingAccount)
  txBuilder.addOperation(sdk.Operation.payment(opts))

  const tx = txBuilder.build()
  tx.sign(issuingAccountKeypair)

  return server.submitTransaction(tx).then(res => res).catch(err => {
    console.error(JSON.stringify(err))
    throw new Error(err)
  })
}

const limitSupply = async (sdk, server, issuingAccountKeypair) => {
  const issuingAccount = await server.loadAccount(
    issuingAccountKeypair.publicKey()
  )
  const txBuilder = new sdk.TransactionBuilder(issuingAccount)
  txBuilder.addOperation(
    sdk.Operation.setOptions({
      masterWeight: 0,
      lowThreshold: 1,
      medThreshold: 1,
      highThreshold: 1,
    })
  )
  const tx = txBuilder.build()
  tx.sign(issuingAccountKeypair)

  return server.submitTransaction(tx).then(res => res).catch(err => {
    console.error(JSON.stringify(err))
    throw new Error(err)
  })
}

class Token {
  constructor(sdk, server) {
    this.sdk = sdk
    this.server = server
  }

  async create(props) {
    console.log(`Create Token: ${JSON.stringify(props)}`)

    //
    // Create new accounts for issuing and/or distribution if not provided
    //

    const {assetCode, limit, numOfTokens, signer} = props
    let {issuingAccountKey, distAccountKey} = props
    let createAccountsResponse
    if (!issuingAccountKey || !distAccountKey) {
      const signingKeypair = this.sdk.Keypair.fromSecret(signer)
      const signingAccount = await this.server.loadAccount(
        signingKeypair.publicKey()
      )
      const {issuing, dist, txResult} = await createTokenAccounts(
        this.sdk,
        this.server,
        signingAccount,
        signingKeypair,
        issuingAccountKey,
        distAccountKey
      )
      if (issuing) issuingAccountKey = issuing.secret()
      if (dist) distAccountKey = dist.secret()
      createAccountsResponse = txResult
    }

    const issuingAccountKeypair = this.sdk.Keypair.fromSecret(issuingAccountKey)
    const distAccountKeypair = this.sdk.Keypair.fromSecret(distAccountKey)
    console.log(`issuingAccountKeypair: ${issuingAccountKeypair.publicKey()}`)
    console.log(`distAccountKeypair: ${distAccountKeypair.publicKey()}`)

    //
    // Add trustline from distribution account to issuing account
    //

    const asset = new this.sdk.Asset(
      assetCode,
      issuingAccountKeypair.publicKey()
    )
    const trustIssuingResponse = await trustIssuingAccount(
      this.sdk,
      this.server,
      distAccountKeypair,
      asset,
      numOfTokens
    )
    console.log(`trustIssuing res=${JSON.stringify(trustIssuingResponse)}`)

    //
    // Create tokens by sending them from issuer to distributer
    //

    const createTokensResponse = await createTokens(
      this.sdk,
      this.server,
      issuingAccountKeypair,
      distAccountKeypair.publicKey(),
      asset,
      numOfTokens
    )
    console.log(`createTokens res=${JSON.stringify(createTokensResponse)}`)

    //
    // Limit supply
    //

    console.log(`limit: ${limit} type: ${typeof limit}`)
    let limitSupplyResponse
    if (limit === true) {
      limitSupplyResponse = await limitSupply(
        this.sdk,
        this.server,
        issuingAccountKeypair
      )
    }
    console.log(
      `limitSupplyResponse res=${JSON.stringify(limitSupplyResponse)}`
    )

    const issuingBalances = await loadBalances(
      this.server,
      issuingAccountKeypair.publicKey()
    )
    const distBalances = await loadBalances(
      this.server,
      distAccountKeypair.publicKey()
    )
    // grab these to show if the supply was locked or not
    const issuingThresholds = await loadThresholds(
      this.server,
      issuingAccountKeypair.publicKey()
    )

    return {
      accounts: {
        distribution: {
          keys: keypairReadable(distAccountKeypair),
          balances: distBalances,
        },
        issuing: {
          keys: keypairReadable(issuingAccountKeypair),
          balances: issuingBalances,
          thresholds: issuingThresholds,
        },
      },
      docTemplate: docTemplate(props.assetCode),
      transactions: {
        createTokens: createTokensResponse,
        trustIssuing: trustIssuingResponse,
        createAccounts: createAccountsResponse ? createAccountsResponse : null,
        limitSupply: limitSupplyResponse ? limitSupplyResponse : null,
      },
      inputs: props,
    }
  }
}

export default Token
