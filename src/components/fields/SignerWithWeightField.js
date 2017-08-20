import React from 'react'
import {Col, FormControl, Row} from 'react-bootstrap'
import PropTypes from 'prop-types'

/**
* Stellar signer field (for jsonschema forms) that renders these inputs side by side:
 *  - Account / Public Key text
 *  - Signer weight number
 */
class SignerWithWeightField extends React.Component {
  constructor(props) {
    super(props)
    console.log(
      `SignerWithWeightField: constructor: uiSchema: ${JSON.stringify(
        props.uiSchema
      )}`
    )
    this.state = {...props.formData}
  }

  handleOnChange = e => {
    const name = e.target.type === 'number' ? 'weight' : 'publicKey'
    this.setState({[name]: e.target.value}, () =>
      this.props.onChange(this.state)
    )
  }

  render() {
    return (
      <Row>
        <Col xs={10}>
          <FormControl
            onChange={this.handleOnChange}
            placeholder={this.props.uiSchema.publicKey['ui:placeholder']}
            type="text"
            value={this.state.publicKey}
          />
        </Col>
        <Col xs={2}>
          <FormControl
            onChange={this.handleOnChange}
            type="number"
            value={this.state.weight}
          />
        </Col>
      </Row>
    )
  }
}

SignerWithWeightField.propTypes = {
  formData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  uiSchema: PropTypes.object,
}

export default SignerWithWeightField
