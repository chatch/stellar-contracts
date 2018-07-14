import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {LinkContainer} from 'react-router-bootstrap'
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom'
import {Col, Grid, Nav, Navbar, NavItem, Row} from 'react-bootstrap'

import Menu from './components/Menu'
import NetworkSelector from './components/NetworkSelector'
import NoMatch from './components/NoMatch'
import SignIn from './components/SignIn'

import JointAccountCustom from './components/contracts/JointAccountCustom'
import JointAccountEqual from './components/contracts/JointAccountEqual'
import MofNSigners from './components/contracts/MofNSigners'
import ROSCARotatedSavings from './components/contracts/ROSCARotatedSavings'
import Token from './components/contracts/Token'

import {networks} from './stellar'
import {storageInit} from './utils'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-json-pretty/src/JSONPretty.1337.css'
import './App.css'

const storage = storageInit()
const initialNetwork = storage.getItem('network') || 'test'
const initialSigner = storage.getItem('signer') || null
const reloadPage = () => window.location.reload(true)

class App extends Component {
  state = {
    network: initialNetwork,
    server: networks[initialNetwork].initFunc(),
    signer: initialSigner,
  }

  networkSwitcher = selectedNetwork => {
    console.log(`NETWORK change: ${this.state.network} to ${selectedNetwork}`)
    storage.setItem('network', selectedNetwork)
    const server = networks[selectedNetwork].initFunc()
    this.setState(
      {
        network: selectedNetwork,
        server: server,
      },
      reloadPage
    )
  }

  onSetSigner = key => {
    this.setState({signer: key})
    storage.setItem('signer', key)
  }

  onUnSetSigner = () => {
    this.setState({signer: null})
    storage.removeItem('signer')
  }

  // @see HOCs.js withServer() to get this as props in any component
  getChildContext() {
    return {server: this.state.server, signer: this.state.signer}
  }

  render() {
    return (
      <Router>
        <div className="App">
          <div className="App-header">
            <Navbar fluid fixedTop collapseOnSelect>
              <Navbar.Header>
                <Navbar.Brand>
                  <Link to="/">
                    <span className="brand-text">Stellar Contracts Wallet</span>
                  </Link>
                </Navbar.Brand>
                <Navbar.Toggle />
              </Navbar.Header>
              <Navbar.Collapse>
                <Nav>
                  <LinkContainer to="/">
                    <NavItem>Menu</NavItem>
                  </LinkContainer>
                </Nav>
                <Navbar.Form pullRight>
                  <NetworkSelector
                    network={this.state.network}
                    switcher={this.networkSwitcher}
                  />
                </Navbar.Form>
                <Navbar.Form pullRight>
                  <SignIn
                    onSetSigner={this.onSetSigner}
                    onUnSetSigner={this.onUnSetSigner}
                  />
                </Navbar.Form>
              </Navbar.Collapse>
            </Navbar>
          </div>
          <Grid>
            <Row className="App-main">
              <Switch>
                <Route exact path="/" component={Menu} />
                <Route
                  exact
                  path="/joint-account/equal"
                  component={JointAccountEqual}
                />
                <Route
                  exact
                  path="/joint-account/custom"
                  component={JointAccountCustom}
                />
                <Route exact path="/m-of-n" component={MofNSigners} />
                <Route exact path="/token" component={Token} />
                <Route
                  exact
                  path="/rosca/rotated-savings"
                  component={ROSCARotatedSavings}
                />
                <Route component={NoMatch} />
              </Switch>
            </Row>
            <Row
              style={{
                borderTop: '1px solid #e5e5e5',
                marginBottom: 20,
                marginTop: 35,
                paddingTop: 10,
              }}
            >
              <Col mdOffset={11} md={1}>
                <a href="https://github.com/chatch/stellar-contracts">Github</a>
              </Col>
            </Row>
          </Grid>
        </div>
      </Router>
    )
  }
}

App.childContextTypes = {
  server: PropTypes.object,
  signer: PropTypes.string,
}

export default App
