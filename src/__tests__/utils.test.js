import sdk from 'stellar-sdk'

import {accountExists} from '../utils'

const VALID_PUBLICKEY = sdk.Keypair.random().publicKey()

it('accountExists catches and processes NotFoundError', async () => {
  const serverRetNotFoundError = {
    loadAccount: jest.fn(() => Promise.reject(new sdk.NotFoundError())),
  }
  expect(await accountExists(VALID_PUBLICKEY, serverRetNotFoundError)).toBe(
    false
  )
})

it('accountExists returns true when account exists', async () => {
  const serverRetAccount = {
    loadAccount: jest.fn(acc => Promise.resolve(new sdk.Account(acc, '1'))),
  }
  expect(await accountExists(VALID_PUBLICKEY, serverRetAccount)).toBe(true)
})
