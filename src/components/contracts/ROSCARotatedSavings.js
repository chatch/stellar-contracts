import React from 'react'
import Form from 'react-jsonschema-form'
import {Col, Grid, Panel, Row} from 'react-bootstrap'
import sdk from 'stellar-sdk'

import Contracts from '../../api'
import CreateButton from '../CreateButton'
import Receipt from '../Receipt'
import {isSignedIn, withServer, withSigner} from '../../utils'

const schema = {
  title: 'ROSCA - Rotated Savings',
  type: 'object',
  required: ['depositAmount', 'startDate'],
  properties: {
    depositAmount: {
      title: 'Daily Deposit (each individual puts this amount in each day)',
      type: 'integer',
    },
    startDate: {
      title: 'Start Date (payments start on this day)',
      format: 'date',
      type: 'string',
    },
    currency: {
      title: 'Currency / Asset',
      type: 'object',
      required: ['assetCode', 'assetIssuer'],
      properties: {
        assetCode: {
          title: 'Asset Code',
          type: 'string',
          maxLength: 12,
        },
        assetIssuer: {
          title: 'Asset Issuer (Public Key)',
          type: 'string',
        },
      },
    },
    members: {
      title: 'Members',
      type: 'array',
      minItems: 3,
      items: {
        type: 'string',
        default: '',
      },
    },
    signer: {type: 'string'},
  },
}
const uiSchema = {
  startDate: {'ui:widget': 'alt-date'},
  depositAmount: {},
  currency: {},
  members: {
    'ui:options': {
      orderable: true,
    },
    'ui:help':
      "Enter stellar public keys for all accounts in the ROSCA. Click the '+' button to add more. Change the order using the up and down arrows.",
    items: {
      'ui:placeholder': 'Public key of member account',
    },
  },
  signer: {
    'ui:widget': 'hidden',
  },
}

const formDataInitial = {
  depositAmount: 100,
  currency: {
    assetCode: 'USD',
  },
  members: [
    'GDHZHBSLDWOBFUJ7KZOF4CLO5POOEPOCMWAKUIK37HL4QCJINIRH5Z2G',
    'GBXLY27M5EKPJ7QLLXOWRDMTVLCOKVYPZLB6EUQP7T4MM4F6RTKG3PRZ',
    'GCUVQ3ADUBUTX6627V27HEZJOCGPSAFQKQBZ5QAPVVK7TQU5CEMG5N6K',
  ],
}

const HelpPanel = () =>
  <Panel bsStyle="info" header="Help">
    <div>
      A contract setup for the ROSCA Rotated Savings or 'Merry-go-round' savings
      club.
    </div>
    <div style={{marginTop: '1em'}}>
      This setup allows any member account to make payments (and other medium
      threshold operations).
    </div>
    <div style={{marginTop: '1em'}}>
      References:
      <div style={{marginLeft: 10}}>
        <div>
          <a href="http://www.jointokyo.org/mfdl/readings/PoorMoney.pdf">
            The Poor and Their Money
          </a>{' '}
          (p.14 'The Merry-go-round')
        </div>
        <div>
          <a href="https://www.stellar.org/developers/guides/concepts/multi-sig.html">
            Multisignature - Stellar
          </a>
        </div>
      </div>
    </div>
  </Panel>

class ROSCARotatedSavings extends React.Component {
  state = {isLoading: false}
  formData = formDataInitial

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

    if (formData.members.length < 3) {
      errors.members.addError(
        "Provide at least 3 member accounts. Click '+' to add a member field."
      )
    }

    if (formData.depositAmount < 1) {
      errors.depositAmount.addError('Deposit amounts must be at least 1.')
    }

    if (!sdk.StrKey.isValidEd25519PublicKey(formData.currency.assetIssuer)) {
      errors.currency.assetIssuer.addError(
        'Account is not a valid ed25519 public key'
      )
    }

    if (formData.currency.assetIssuerdepositAmount < 1) {
      errors.depositAmount.addError('Deposit amounts must be at least 1.')
    }

    formData.members.forEach((member, idx) => {
      if (!sdk.StrKey.isValidEd25519PublicKey(member)) {
        errors.members[idx].addError(
          'Account is not a valid ed25519 public key'
        )
      }
    })

    return errors
  }

  handleOnSubmit = ({formData}) => {
    this.setState({error: null, isLoading: true})
    const contracts = new Contracts(this.props.server)
    const contract = contracts.roscaRotatedSavings()
    contract
      .create({
        ...formData.currency,
        depositAmount: formData.depositAmount,
        startDate: formData.startDate,
        members: formData.members,
        signerSecret: this.props.signer,
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
            {<HelpPanel />}
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default withServer(withSigner(ROSCARotatedSavings))
