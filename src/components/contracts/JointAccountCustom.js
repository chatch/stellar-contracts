import React from 'react'
import {Panel} from 'react-bootstrap'
import JointAccountBase from './JointAccountBase'

const formData = {
  jointAccount: {secretKey: ''},
  members: [{publicKey: '', weight: 1}],
}

const HelpPanel = () =>
  <Panel bsStyle="info" header="Help">
    <div>
      Create a joint account setting weights and thresholds. This setup allows a
      range of joint account types to be setup.
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
