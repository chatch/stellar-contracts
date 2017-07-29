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
    path: '/jointaccount',
    name: 'Joint Account',
    description: 'Create a simple Joint Account',
  },
  {
    path: '/mofn',
    name: 'M of N Signers',
    description: 'Create accounts with M of N Signer schemes',
  },
  {
    path: '/bond',
    name: 'Bonds',
    description: 'Issue Bonds [TODO]',
  },
  {
    path: '/channel',
    name: 'Channels',
    description: 'Setup Payment Channels [TODO]',
  },
]

const IntroductionPanel = () =>
  <Panel bsStyle="info" header="Introduction">
    <div>
      This site presents smart contract patterns for the{' '}
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
                <Col md={3}>
                  <Link to={c.path}>
                    {c.name}
                  </Link>
                </Col>
                <Col md={9}>
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
