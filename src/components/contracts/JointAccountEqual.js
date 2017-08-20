import React from 'react'
import {Panel} from 'react-bootstrap'
import JointAccountBase from './JointAccountBase'

const formData = {
  jointAccount: {secretKey: ''},
  members: [
    {publicKey: '', weight: 1},
    {publicKey: '', weight: 1},
    {publicKey: '', weight: 1},
  ],
  thresholds: {low: 3, med: 3, high: 3, masterWeight: 0},
}

const HelpPanel = () =>
  <Panel bsStyle="info" header="Help">
    <div>Creates a simple joint account on the Stellar Network.</div>
    <div style={{marginTop: '1em'}}>
      This setup allows any member account to make payments (and other medium
      threshold operations).
    </div>
    <div style={{marginTop: '1em'}}>
      However high threshold operations like changing the list of signers
      requires all parties to sign.
    </div>
    <div style={{marginTop: '1em'}}>
      References:
      <div style={{marginLeft: 10}}>
        <div>
          <a href="https://www.stellar.org/developers/guides/concepts/multi-sig.html#example-2-joint-accounts">
            Joint Accounts
          </a>
        </div>
        <div>
          <a href="https://www.stellar.org/developers/guides/concepts/multi-sig.html">
            Multisig
          </a>
        </div>
      </div>
    </div>
  </Panel>

export default () =>
  <JointAccountBase formData={formData} HelpPanel={HelpPanel} />
