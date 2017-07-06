import React, {Component} from 'react'
import {Link, BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {Grid, Row} from 'react-bootstrap'

import Menu from './components/Menu'
import ICO from './components/contracts/ICO'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

class NoMatch extends Component {
  render() {
    return <h3>Oops, nothing here ...</h3>
  }
}

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <div className="App-header">
            <h4>
              <Link to="/">Simple Contracts</Link>
            </h4>
          </div>
          <Grid>
            <Row className="App-main">
              <Switch>
                <Route exact path="/" component={Menu} />
                <Route exact path="/ico" component={ICO} />
                <Route component={NoMatch} />
              </Switch>
            </Row>
          </Grid>
        </div>
      </Router>
    )
  }
}

export default App
