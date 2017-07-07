import React from 'react'
import {Col, Grid, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'

const contracts = [
  {
    path: '/ico',
    name: 'ICO',
    description: 'Issue a New Token',
  },
  {
    path: '/bond',
    name: 'Bond',
    description: 'Issue Bonds [TODO]',
  },
]

class Menu extends React.Component {
  render() {
    return (
      <Grid>
        <Row style={{marginBottom: 30}}>
          <h3>Contracts</h3>
        </Row>
        {contracts.map(c =>
          <Row>
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
      </Grid>
    )
  }
}

export default Menu
