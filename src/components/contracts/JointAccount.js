import React from 'react'
import Form from 'react-jsonschema-form'
import {Col, Grid, Panel, Row} from 'react-bootstrap'
import sdk from 'stellar-sdk'

import Contracts from '../../api'
import AccountField from '../AccountField'
import CreateButton from '../CreateButton'
import Receipt from '../Receipt'
import {isSignedIn, withServer, withSigner} from '../../utils'

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
  description:
    "1) Enter Secret Key of an existing account  OR  2) 'Generate' new account  OR  3) 'Use Signer'",
  type: 'object',
  properties: {
    account: {
      title: 'Account',
      type: 'object',
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
    'ui:field': 'account',
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
  account: AccountField,
}

class JointAccount extends React.Component {
  formData = {
    account: '',
    members: [''],
  }

  state = {isLoading: false}

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
    this.setState({error: null, isLoading: true})
    const contracts = new Contracts(this.props.server)
    const contract = contracts.jointAccount()
    contract
      .create({
        accountSecret: formData.account.secret,
        members: formData.members,
        signer: this.props.signer,
      })
      .then(receipt => {
        console.log(JSON.stringify(receipt))
        this.setState({isLoading: false, receipt: receipt})
      })
      .catch(err => {
        this.setState({
          isLoading: false,
          error: err.detail ? err.detail : err.message,
        })
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
              <CreateButton
                errorMsg={
                  this.state.error && typeof this.state.error === 'string'
                    ? this.state.error
                    : ''
                }
                isLoading={this.state.isLoading}
              />
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
