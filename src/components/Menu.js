import React from 'react'
import {Col, Grid, Panel, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'

const contracts = [
  {
    path: '/token',
    name: 'Token',
    description: 'Issue a New Token on Stellar',
  },
  {
    path: '/joint-account/custom',
    name: 'Joint Account (Customize)',
    description: 'Create a joint account setting custom weights and thresholds',
  },
  {
    path: '/joint-account/equal',
    name: 'Joint Account (Preset: Equal Weights)',
    description: 'Simple joint account with equal weights for all members',
  },
  {
    path: '/rosca/rotated-savings',
    name: 'ROSCA (rotated savings)',
    description: 'Setup a "Rotated Savings" / "Merry-Go-Round" style ROSCA',
  },
  {
    path: '/m-of-n-todo',
    name: 'M of N Signers [TODO]',
    description: 'Create accounts with M of N Signer schemes',
  },
  {
    path: '/bond',
    name: 'Bonds [TODO]',
    description: 'Issue Bonds',
  },
  {
    path: '/channel',
    name: 'Channels [TODO]',
    description: 'Setup Payment Channels',
  },
]

const IntroductionPanel = () =>
  <Panel bsStyle="info" header="Introduction">
    <div>
      This is a wallet that presents smart contract patterns for the{' '}
      <a href="https://stellar.org">Stellar Network</a>. See{' '}
      <a href="https://www.stellar.org/blog/multisig-and-simple-contracts-stellar/">
        this post
      </a>{' '}
      for some background on contracts on Stellar.
    </div>
    <div style={{marginTop: '1em'}}>
      To setup a contract, fill in the contract form and click Create to submit
      it to the network. You will receive a JSON receipt with full details of
      inputs, accounts created, transaction hashes, etc.
    </div>
    <div style={{color: 'red', marginTop: '1em'}}>
      WARNING: This is BETA software. Test these contracts thoroughly on testnet
      before using them on the public network.
    </div>
  </Panel>

class Menu extends React.Component {
  render() {
    return (
      <Grid>
        <Row>
          <Col md={8}>
            <Row>
              <h3>Contracts</h3>
            </Row>
            {contracts.map(c =>
              <Row key={c.name} style={{marginTop: 10}}>
                <Col md={4}>
                  <Link to={c.path}>
                    {c.name}
                  </Link>
                </Col>
                <Col md={8}>
                  {c.description}
                </Col>
              </Row>
            )}
          </Col>
          <Col md={4} style={{marginTop: 20}}>
            <IntroductionPanel />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default Menu
