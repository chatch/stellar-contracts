import React from 'react'
import Form from 'react-jsonschema-form'
import {Col, Grid, Row} from 'react-bootstrap'
import sdk from 'stellar-sdk'

import Contracts from '../../api'
import AccountWithHelpersField from '../fields/AccountWithHelpersField'
import SignerWithWeightField from '../fields/SignerWithWeightField'
import CreateButton from '../CreateButton'
import Receipt from '../Receipt'
import {isSignedIn, withServer, withSigner} from '../../utils'

const schema = {
  title: 'Joint Account',
  description:
    "1) Enter Secret Key of an existing account  OR  2) 'Generate' new account  OR  3) 'Use Signer'",
  type: 'object',
  properties: {
    jointAccount: {
      title: 'Account',
      type: 'object',
    },
    members: {
      title: 'Members',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          publicKey: {
            type: 'string',
            default: '',
          },
          weight: {
            type: 'integer',
            default: 1,
          },
        },
      },
    },
    thresholds: {
      title: 'Thresholds',
      type: 'object',
      properties: {
        high: {
          title: 'High',
          type: 'integer',
          default: 0,
        },
        med: {
          title: 'Medium',
          type: 'integer',
          default: 0,
        },
        low: {
          title: 'Low',
          type: 'integer',
          default: 0,
        },
        masterWeight: {
          title: 'Master Weight',
          type: 'integer',
          default: 0,
        },
      },
    },
    signer: {type: 'string'},
  },
}
const uiSchema = {
  jointAccount: {
    'ui:field': 'account',
    'ui:placeholder': 'Secret key of joint account ',
  },
  members: {
    'ui:options': {
      orderable: false,
    },
    'ui:help':
      "Enter stellar public keys for all accounts to add as signers. Click the '+' button to add more.",
    items: {
      'ui:field': 'memberAccount',
      publicKey: {
        'ui:placeholder': 'Public key of member account',
      },
    },
  },
  thresholds: {
    'ui:help': 'Apply joint account thresholds ...',
  },
  signer: {
    'ui:widget': 'hidden',
  },
}

const fields = {
  account: AccountWithHelpersField,
  memberAccount: SignerWithWeightField,
}

class JointAccountCustom extends React.Component {
  state = {isLoading: false}

  constructor(props) {
    super(props)
    this.formData = this.props.formData
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
      if (!sdk.StrKey.isValidEd25519PublicKey(member.publicKey)) {
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
        accountSecret: formData.jointAccount.secretKey,
        members: formData.members,
        signerSecret: this.props.signer,
      })
      .then(receipt => {
        console.log(JSON.stringify(receipt))
        this.setState({isLoading: false, receipt: receipt})
      })
      .catch(err => {
        console.error(`create failed:`)
        console.error(err)
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
            {<this.props.HelpPanel />}
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default withServer(withSigner(JointAccountCustom))
