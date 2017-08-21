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
  required: ['startDate'],
  properties: {
    currency: {
      title: 'Currency / Asset',
      type: 'object',
      required: ['assetCode', 'assetIssuer', 'depositAmount'],
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
        depositAmount: {
          title: 'Daily Deposit (each individual)',
          type: 'integer',
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
    startDate: {
      title: 'Start Date',
      format: 'date',
      type: 'string',
    },
    signer: {type: 'string'},
  },
}
const uiSchema = {
  currency: {
    depositAmount: {
      'ui:help':
        'Amount of the asset required to be deposited each day by each individual.',
    },
  },
  members: {
    'ui:options': {
      orderable: true,
    },
    'ui:help':
      "Enter stellar public keys for all accounts in the ROSCA. Accounts should have trustlines to the asset issuer already. Click the '+' button to add more. Change the order using the up and down arrows.",
    items: {
      'ui:placeholder': 'Public key of member account',
    },
  },
  startDate: {
    'ui:widget': 'alt-date',
    'ui:help':
      'Payments will start on this day and so the first payout will also be on this day.',
  },
  signer: {
    'ui:widget': 'hidden',
  },
}

// preseed with some testdata
// TODO: remove this after testing ...
const formDataInitial = {
  currency: {
    assetCode: 'KHR',
    assetIssuer: 'GBWINCFVJ3YOYEKXRSKI5M4I4X7QEPXCZ242NOAYPQV3XMTDHLBFKYEO',
    depositAmount: 10000,
  },
  members: [
    'GDHZHBSLDWOBFUJ7KZOF4CLO5POOEPOCMWAKUIK37HL4QCJINIRH5Z2G',
    'GBXLY27M5EKPJ7QLLXOWRDMTVLCOKVYPZLB6EUQP7T4MM4F6RTKG3PRZ',
    'GCUVQ3ADUBUTX6627V27HEZJOCGPSAFQKQBZ5QAPVVK7TQU5CEMG5N6K',
  ],
}

const headSpace = {marginTop: '1em'}

const HelpPanel = () =>
  <Panel bsStyle="info" header="Help">
    <div>
      A contract setup for ROSCA Rotated Savings or 'Merry-go-round' savings
      clubs.
    </div>
    <div style={headSpace}>
      Pay outs follow a simple fixed order determined when the contract is
      created. So no bids are made for the payout each round.
    </div>
    <div style={headSpace}>
      NOTE: ideally each member is running a wallet that takes deposits and
      coordinates payment of the payout each round. This contract creation just
      demonstrates how the scheme might be setup intially.
    </div>
    <div style={headSpace}>
      <div>
        <h4>Asset Issuer</h4>
      </div>
      <div>
        Select an issuer for the deposit asset. Typically this will be an issuer
        for the local currency.
      </div>
      <div style={headSpace}>
        It might be simplest for the group to setup thier own issuer account or
        designate a deposit collector account as the issuer here.
      </div>
      <div style={headSpace}>
        Alternatively if all members already have currency with a local provider
        on the Stellar network then it might make sense to set that provider
        here.
      </div>
    </div>
    <div style={headSpace}>
      <div>
        <h4>Trustline from Members to Asset Issuer</h4>
      </div>
      All members need a trustline in Stellar to the asset issuer before
      submitting this form. An error message will be displayed on create if
      accounts don't have trust.
    </div>
    <div style={headSpace}>
      <div>
        <h4>Payout Order</h4>
      </div>
      Payout order is fixed and reflects the order on the form. So group should
      agree no order BEFORE contract creation. Use the up and down arrows next
      to the member account fields to change the order.
    </div>
    <div style={headSpace}>
      <div>
        <h4>Timing</h4>
      </div>
      Select Start Date of the ROSCA. The first deposits and payout will be on
      this day. The last day of the round will be 'N members' days after the
      start date.
    </div>
    <div style={headSpace}>
      <div>
        <h4>References</h4>
      </div>
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
        <div>
          <a href="https://www.stellar.org/developers/guides/concepts/assets.html">
            Assets and Trustlines - Stellar
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

    if (formData.currency.depositAmount < 1) {
      errors.currency.depositAmount.addError(
        'Deposit amounts must be at least 1.'
      )
    }

    if (!sdk.StrKey.isValidEd25519PublicKey(formData.currency.assetIssuer)) {
      errors.currency.assetIssuer.addError(
        'Account is not a valid ed25519 public key'
      )
    }

    if (formData.members.length < 3) {
      errors.members.addError(
        "Provide at least 3 member accounts. Click '+' to add a member field."
      )
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
        startDate: formData.startDate,
        members: formData.members,
        signerSecret: this.props.signer,
      })
      .then(receipt => {
        console.log(JSON.stringify(receipt))
        this.setState({isLoading: false, receipt: receipt})
      })
      .catch(err => {
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
          <Col md={7}>
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
          <Col md={5} style={{marginTop: 20}}>
            <HelpPanel />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default withServer(withSigner(ROSCARotatedSavings))
