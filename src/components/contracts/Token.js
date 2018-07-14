import React from 'react'
import Form from 'react-jsonschema-form'
import {Col, Grid, Panel, Row} from 'react-bootstrap'
import sdk from 'stellar-sdk'
import _ from 'lodash'

import Contracts from '../../api'
import Receipt from '../Receipt'
import CreateButton from '../CreateButton'
import {isSignedIn, withServer, withSigner} from '../../utils'

const schema = {
  title: 'Token - Issue a New Token',
  type: 'object',
  properties: {
    assetDetails: {
      title: 'Asset Details',
      type: 'object',
      required: ['assetCode', 'numOfTokens'],
      properties: {
        assetCode: {
          type: 'string',
          title: 'Asset Code',
          maxLength: 12,
        },
        numOfTokens: {
          type: 'integer',
          title: 'Number of Tokens',
        },
      },
    },
    accounts: {
      title: 'Accounts (optional)',
      type: 'object',
      properties: {
        issuingAccountKey: {
          type: 'string',
          title: 'Issuing Account Signing Key',
        },
        distAccountKey: {
          type: 'string',
          title: 'Distribution Account Signing Key',
        },
      },
    },
    limitFlag: {
      title: 'Limit Supply (optional)',
      type: 'object',
      properties: {
        limit: {
          type: 'boolean',
          title: 'Limit [if checked the supply will be fixed forever]',
          default: false,
        },
      },
    },
    signer: {type: 'string'},
  },
}

// add this to the description : .&nbsp;<a href='https://www.stellar.org/developers/guides/concepts/assets.html#anchors-issuing-assets'>See details on supported formats here.</a>",
const uiSchema = {
  assetDetails: {
    assetCode: {
      'ui:description':
        "Codes are alphanumeric strings up to 12 characters in length. See 'Issuing Assets' link for full details.",
      'ui:placeholder': 'eg. BEAN',
    },
    numOfTokens: {
      'ui:placeholder': 'Number of tokens to Issue',
    },
  },
  accounts: {
    issuingAccountKey: {
      'ui:help': 'Leave blank to have a new account created',
      'ui:placeholder': 'Issuing account signing key (Optional)',
    },
    distAccountKey: {
      'ui:help': 'Leave blank to have a new account created',
      'ui:placeholder': 'Distribution account signing key (Optional)',
    },
  },
  signer: {
    'ui:widget': 'hidden',
  },
}

const HelpPanel = () => (
  <Panel bsStyle="info" header="Help">
    <div>Creates a new token on the Stellar Network.</div>
    <div style={{marginTop: '1em'}}>
      This contract mirrors the setup described in the 'Tokens on Stellar'
      article (link below). Check it out for full details.
    </div>
    <div style={{marginTop: '1em'}}>
      To create, simply enter an Asset Code and Number of Tokens to issue. An
      issuing and distribution account will be created for you and the keys for
      these will be included in the contract receipt.
    </div>
    <div style={{marginTop: '1em'}}>
      However if you have account(s) setup already for these roles then enter
      the signing keys for these so they can be configured for the token.
    </div>
    <div style={{marginTop: '1em'}}>
      References:
      <div style={{marginLeft: 10}}>
        <div>
          <a href="https://www.stellar.org/blog/tokens-on-stellar/">
            Tokens on Stellar
          </a>
        </div>
        <div>
          <a href="https://www.stellar.org/developers/guides/issuing-assets.html">
            Issuing Assets
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
)

class Token extends React.Component {
  formData = {}
  state = {isLoading: false}

  constructor(props) {
    super(props)
    this.formData.signer = props.signer ? props.signer : ''
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.signer !== nextProps.signer)
      this.formData.signer = nextProps.signer
  }

  formValidate(formData, errors) {
    console.log(`Validate: ${JSON.stringify(formData)}`)

    // check user is signed in as we need a tx signer
    if (!isSignedIn(formData))
      errors.signer.addError(
        "You must be signed in to create this contract. Click 'Sign In' in the page header."
      )

    const accs = formData.accounts

    const signKeyFields = ['issuingAccountKey', 'distAccountKey']
    signKeyFields.forEach(signKeyField => {
      if (
        !_.isEmpty(accs[signKeyField]) &&
        !sdk.StrKey.isValidEd25519SecretSeed(accs[signKeyField])
      ) {
        errors.accounts[signKeyField].addError(
          'Signing key is not a valid ed25519 secret seed'
        )
      }
    })

    return errors
  }

  handleOnSubmit = ({formData}) => {
    this.setState({error: null, isLoading: true})

    const tokenOpts = {
      ...formData.accounts,
      ...formData.assetDetails,
      ...formData.limitFlag,
      signer: formData.signer,
    }

    const contracts = new Contracts(this.props.server)
    const tokenContract = contracts.token()
    tokenContract
      .create(tokenOpts)
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
              formData={this.formData}
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

export default withServer(withSigner(Token))
