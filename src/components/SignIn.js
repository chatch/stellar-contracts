import React from 'react'
import PropTypes from 'prop-types'
import {Button, Modal} from 'react-bootstrap'
import Form from 'react-jsonschema-form'
import truncate from 'lodash/truncate'
import {Keypair, StrKey} from 'stellar-sdk'
import {withServer, withSigner} from '../utils'

const schema = {
  description: 'Enter signing key of the contract signing account:',
  type: 'object',
  properties: {
    signingKey: {
      title: 'Signing Key',
      type: 'string',
    },
  },
}

const formData = {
  signingKey: '',
}

const uiSchema = {
  signingKey: {
    'ui:autofocus': true,
  },
}

const SignInButton = ({handleOpen}) =>
  <Button bsStyle="primary" onClick={handleOpen} style={{marginRight: 30}}>
    Sign In
  </Button>

const SignedInWithSignOutButton = ({balance, handleOnSignOut, publicKey}) =>
  <span>
    <span alt={publicKey} style={{marginRight: 30}}>
      <a href={`https://steexp.com/account/${publicKey}`} target="_blank">
        {truncate(publicKey, {
          length: 10,
        })}
      </a>
      {balance &&
        <span>
          &nbsp;({Number.parseInt(balance, 10)} XLM)
        </span>}
    </span>
    <Button bsStyle="warning" onClick={handleOnSignOut}>
      Sign Out
    </Button>
  </span>

const SignInModal = ({formValidate, handleOnSubmit, handleClose, showModal}) =>
  <Modal show={showModal} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Sign In</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form
        formData={formData}
        onSubmit={handleOnSubmit}
        schema={schema}
        uiSchema={uiSchema}
        validate={formValidate}
      >
        <Button bsStyle="info" type="submit">
          Sign In
        </Button>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleClose}>Close</Button>
    </Modal.Footer>
  </Modal>

const secretToPublicKey = secret => Keypair.fromSecret(secret).publicKey()

class SignIn extends React.Component {
  state = {showModal: false}

  componentDidMount() {
    if (this.props.signer && this.props.signer != null)
      this.props.server
        .loadAccount(secretToPublicKey(this.props.signer))
        .then(acc => {
          console.log(acc.balances[0])
          this.setState({balanceXLM: acc.balances[0].balance})
        })
        .catch(err =>
          console.error(
            `Failed to loadAccount for signer: ${JSON.stringify(err)}`
          )
        )
  }

  formValidate = (formData, errors) => {
    if (!StrKey.isValidEd25519SecretSeed(formData.signingKey)) {
      errors.signingKey.addError(
        'Signing key is not a valid ed25519 secret seed'
      )
    }
    return errors
  }

  handleClose = () => {
    this.setState({showModal: false})
  }

  handleOnSignOut = () => {
    this.props.onUnSetSigner()
  }

  handleOnSubmit = ({formData}) => {
    this.props.onSetSigner(formData.signingKey)
    this.handleClose()
  }

  handleOpen = () => {
    this.setState({showModal: true})
  }

  render() {
    const publicKey =
      this.props.signer && this.props.signer != null
        ? secretToPublicKey(this.props.signer)
        : undefined

    return (
      <div>
        {!publicKey && <SignInButton handleOpen={this.handleOpen} />}
        {publicKey &&
          <SignedInWithSignOutButton
            balance={this.state.balanceXLM}
            handleOnSignOut={this.handleOnSignOut}
            publicKey={publicKey}
          />}
        <SignInModal
          formValidate={this.formValidate}
          handleClose={this.handleClose}
          handleOnSubmit={this.handleOnSubmit}
          showModal={this.state.showModal}
        />
      </div>
    )
  }
}

SignIn.propTypes = {
  onSetSigner: PropTypes.func.isRequired,
  onUnSetSigner: PropTypes.func.isRequired,
  server: PropTypes.object.isRequired,
  signer: PropTypes.string,
}

export default withServer(withSigner(SignIn))
