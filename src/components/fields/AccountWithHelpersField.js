import React from 'react'
import {Button, Col, FormControl, Row} from 'react-bootstrap'
import PropTypes from 'prop-types'
import sdk from 'stellar-sdk'

/**
 * Stellar account field (for jsonschema forms) that adds:
 *  - Generate button - to create a new account
 *  - Use Signer button - to use account signed into the app
 */
class AccountWithHelpersField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {...props.formData}
  }

  handleOnClickGenerate = () => {
    const newKeypair = sdk.Keypair.random()
    this.setState(
      {
        secretKey: newKeypair.secret(),
      },
      () => this.props.onChange(this.state)
    )
  }

  handleOnClickUseSigner = signer => {
    this.setState({secretKey: signer}, () => this.props.onChange(this.state))
  }

  handleOnChange = e => {
    console.log(`AccountWithHelpersField: onChange: ${e.target.value}`)
    this.setState({secretKey: e.target.value}, () =>
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
            value={this.state.secretKey}
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

AccountWithHelpersField.propTypes = {
  formContext: PropTypes.shape({
    signer: PropTypes.string,
  }).isRequired,
  formData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
}

export default AccountWithHelpersField
