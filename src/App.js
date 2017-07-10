import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {LinkContainer} from 'react-router-bootstrap'
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom'
import {Grid, Row, Nav, Navbar, NavItem} from 'react-bootstrap'

import Menu from './components/Menu'
import NetworkSelector from './components/NetworkSelector'
import NoMatch from './components/NoMatch'
import Token from './components/contracts/Token'

import {networks} from './stellar'
import {storageInit} from './utils'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

const storage = storageInit()
const initialNetwork = storage.getItem('network') || 'test'
const reloadPage = () => window.location.reload(true)

class App extends Component {
  state = {
    network: initialNetwork,
    server: networks[initialNetwork].initFunc(),
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

  // @see HOCs.js withServer() to get this as props in any component
  getChildContext() {
    return {server: this.state.server}
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
                    <span className="brand-text">Stellar Contracts</span>
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
              </Navbar.Collapse>
            </Navbar>
          </div>
          <Grid>
            <Row className="App-main">
              <Switch>
                <Route exact path="/" component={Menu} />
                <Route exact path="/token" component={Token} />
                <Route component={NoMatch} />
              </Switch>
            </Row>
          </Grid>
        </div>
      </Router>
    )
  }
}

App.childContextTypes = {
  server: PropTypes.object,
}

export default App
