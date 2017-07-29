import React from 'react'
import Form from 'react-jsonschema-form'
import {Button, Col, FormControl, Grid, Panel, Row} from 'react-bootstrap'
import sdk from 'stellar-sdk'

import Contracts from '../../api'
import Receipt from '../Receipt'
import {isSignedIn, withServer, withSigner} from '../../utils'

class AccountSelectorField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {...props.formData}
  }

  handleOnClickGenerate = () => {
    const newKeypair = sdk.Keypair.random()
    this.setState({
      publicKey: newKeypair.publicKey(),
      secret: newKeypair.secret(),
    })
  }

  handleOnClickUseSigner = signer => {
    const keypair = sdk.Keypair.fromSecret(signer)
    this.setState({publicKey: keypair.publicKey(), secret: keypair.secret()})
  }

  handleOnChange = e => {
    console.log(`onChange: ${e.target.value}`)
    this.setState({secret: e.target.value})
  }

  render() {
    return (
      <Row>
        <Col xs={8}>
          <FormControl
            placeholder={this.props.uiSchema['ui:placeholder']}
            type="text"
            value={this.state.publicKey}
            onChange={this.handleOnChange}
          />
        </Col>
        <Col xs={2}>
          <Button bsStyle="success" onClick={this.handleOnClickGenerate}>
            Generate
          </Button>
        </Col>
        <Col xs={2}>
          <Button
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

const HelpPanel = () =>
  <Panel bsStyle="info" header="Help">
    <div>Creates a simple joint account on the Stellar Network.</div>
    <div style={{marginTop: '1em'}}>
      This setup allows any member account to make payments (and other medium
      threshold operations).
    </div>
    <div style={{marginTop: '1em'}}>
      However high threshold operations like changing the list of signers
      requires all parties to sign.
    </div>
    <div style={{marginTop: '1em'}}>
      References:
      <div style={{marginLeft: 10}}>
        <div>
          <a href="https://www.stellar.org/developers/guides/concepts/multi-sig.html#example-2-joint-accounts">
            Joint Accounts
          </a>
        </div>
        <div>
          <a href="https://www.stellar.org/developers/guides/concepts/multi-sig.html">
            Multisig
          </a>
        </div>
      </div>
    </div>
  </Panel>

const schema = {
  title: 'Joint Account',
  type: 'object',
  properties: {
    account: {
      title: 'Account',
      type: 'object',
      properties: {
        publicKey: {
          type: 'string',
        },
        secret: {
          type: 'string',
        },
      },
    },
    members: {
      title: 'Members',
      type: 'array',
      items: {
        type: 'string',
        default: '',
      },
    },
    signer: {type: 'string'},
  },
}

const uiSchema = {
  account: {
    'ui:field': 'accountSelector',
    publicKey: {
      'ui:placeholder':
        "1) Enter Secret Key of an existing account  OR  2) 'Generate' new account  OR  3) 'Use Signer'",
    },
    secret: {
      'ui:widget': 'hidden',
    },
  },
  members: {
    'ui:options': {
      orderable: false,
    },
    'ui:help':
      "Enter stellar public keys for all accounts to add as signers. Click the '+' button to add more.",
  },
  signer: {
    'ui:widget': 'hidden',
  },
}

const fields = {
  accountSelector: AccountSelectorField,
}

class JointAccount extends React.Component {
  formData = {
    account: {publicKey: '', signer: ''},
    members: [''],
  }
  state = {}

  constructor(props) {
    super(props)
    this.formData.signer = props.signer ? props.signer : ''
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.signer !== nextProps.signer)
      this.formData.signer = nextProps.signer
  }

  formValidate = (formData, errors) => {
    console.log(`Validate: ${JSON.stringify(formData)}`)

    // check user is signed in as we need a tx signer
    if (!isSignedIn(formData))
      errors.signer.addError(
        "You must be signed in to create this contract. Click 'Sign In' in the page header."
      )

    if (formData.members.length < 1) {
      errors.members.addError(
        "Provide at least 1 member account. Click '+' to add a member field."
      )
    }

    formData.members.forEach((member, idx) => {
      if (!sdk.StrKey.isValidEd25519PublicKey(member)) {
        errors.members[idx].addError(
          'Account is not a valid ed25519 public key'
        )
      }
      // TODO: check account exists on the network too .. (server.loadAccount)
    })

    return errors
  }

  handleOnSubmit = ({formData}) => {
    const contracts = new Contracts(this.props.server)
    const contract = contracts.jointAccount()
    contract.create(formData).then(receipt => {
      console.log(JSON.stringify(receipt))
      this.setState({receipt: receipt})
    })
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={8}>
            <Form
              fields={fields}
              formData={this.formData}
              formContext={{signer: this.props.signer}}
              onSubmit={this.handleOnSubmit}
              schema={schema}
              uiSchema={uiSchema}
              validate={this.formValidate}
            >
              <Button bsStyle="info" type="submit">
                Create
              </Button>
            </Form>
            {this.state.receipt && <Receipt receipt={this.state.receipt} />}
          </Col>
          <Col md={4} style={{marginTop: 20}}>
            <HelpPanel />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default withServer(withSigner(JointAccount))
