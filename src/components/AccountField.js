import React from 'react'
import {Button, Col, FormControl, Row} from 'react-bootstrap'
import PropTypes from 'prop-types'
import sdk from 'stellar-sdk'

/**
 * Stellar account field (for jsonschema forms) that adds:
 *  - Generate button - to create a new account
 *  - Use Signer button - to use account signed into the app
 */
class AccountField extends React.Component {
  constructor(props) {
    super(props)
    // console.log(
    //   `AccountField: constructor: formData: ${JSON.stringify(props.formData)}`
    // )
    this.state = {...props.formData}
  }

  handleOnClickGenerate = () => {
    const newKeypair = sdk.Keypair.random()
    this.setState(
      {
        secret: newKeypair.secret(),
      },
      () => this.props.onChange(this.state)
    )
  }

  handleOnClickUseSigner = signer => {
    this.setState({secret: signer}, () => this.props.onChange(this.state))
  }

  handleOnChange = e => {
    console.log(`AccountField: onChange: ${e.target.value}`)
    this.setState({secret: e.target.value}, () =>
      this.props.onChange(this.state)
    )
  }

  render() {
    return (
      <Row>
        <Col xs={8}>
          <FormControl
            onChange={this.handleOnChange}
            placeholder={this.props.uiSchema['ui:placeholder']}
            type="text"
            value={this.state.secret}
          />
        </Col>
        <Col xs={2}>
          <Button
            id="btn-generate"
            bsStyle="success"
            onClick={this.handleOnClickGenerate}
          >
            Generate
          </Button>
        </Col>
        <Col xs={2}>
          <Button
            id="btn-use-signer"
            bsStyle="success"
            onClick={() =>
              this.handleOnClickUseSigner(this.props.formContext.signer)}
          >
            Use Signer
          </Button>
        </Col>
      </Row>
    )
  }
}

AccountField.propTypes = {
  formContext: PropTypes.shape({
    signer: PropTypes.string,
  }).isRequired,
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  uiSchema: PropTypes.shape({
    'ui:placeholder': PropTypes.string,
  }).isRequired,
}

export default AccountField
