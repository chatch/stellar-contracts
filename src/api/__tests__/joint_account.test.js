import sdk from 'stellar-sdk'
import JointAccount from '../joint_account'
import {memberList, signerObj, thresholdsObj} from '../../utils'

const SIGNER = sdk.Keypair.fromSecret(
  'SAP4WQ7W3JS72NGGTJ3X7FM3VGMVI5AIWS5VUOXK4MJECLTOPDUE7VMK'
)
const JOINT_NEW = sdk.Keypair.fromSecret(
  'SABRXC3RQJVVUS22N7H6WGZPTWJ7GBKIZ3PBGX4NWKZZSLC4DWIUP4K3'
)
const MEMBER1 = sdk.Keypair.fromPublicKey(
  'GAJ3VIHUHOHPI7HIJ3DS5HJ5K7CMJ5QVVCO4IXBIG32HGM3WAS3OEOMA'
)
const MEMBER2 = sdk.Keypair.fromPublicKey(
  'GBN4BQAIFUEKYOEYAI4ZEWUK7UW4QVCFVT4VD643L5O7IBCZEES3R6D3'
)
const MEMBER3 = sdk.Keypair.fromPublicKey(
  'GAGXSBXBSJUYCYM623OQQK5P3PXT2BOCKRXU7TVAEOZB5CET2ABJX2T6'
)

const MEMBERS_EQUAL_WEIGHTS = memberList([
  MEMBER1.publicKey(),
  MEMBER2.publicKey(),
  MEMBER3.publicKey(),
])
const MEMBERS_WITH_WEIGHTS = memberList(
  [MEMBER1.publicKey(), MEMBER2.publicKey(), MEMBER3.publicKey()],
  [2, 1, 1]
)

const mockServer = {
  loadAccount: jest.fn(account => {
    if (account === SIGNER.publicKey())
      return Promise.resolve(new sdk.Account(account, '1'))
    else if (account === JOINT_NEW.publicKey()) {
      const acc = new sdk.Account(account, '1')
      acc.signers = [
        signerObj(MEMBER1.publicKey(), 1),
        signerObj(MEMBER2.publicKey(), 1),
        signerObj(MEMBER3.publicKey(), 1),
      ]
      acc.thresholds = thresholdsObj(0, 0, MEMBERS_EQUAL_WEIGHTS)
      return Promise.resolve(acc)
    }
  }),
  submitTransaction: jest.fn(() => Promise.resolve({fake: 'receipt'})),
}

// not using any network but the sdk needs this to be set to something
sdk.Network.useTestNetwork()

const jointAccount = new JointAccount(sdk, mockServer)

it('joint account simple equal weights creates ok', async () => {
  const inputs = {
    accountSecret: JOINT_NEW.secret(),
    members: MEMBERS_EQUAL_WEIGHTS,
    signerSecret: SIGNER.secret(),
    thresholds: Object.assign(
      {masterWeight: 1},
      thresholdsObj(0, 0, MEMBERS_EQUAL_WEIGHTS.length)
    ),
  }
  const receipt = await jointAccount.create(inputs)
  expect(receipt).toMatchSnapshot()
})
