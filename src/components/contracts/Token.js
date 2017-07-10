import React from 'react'
import Form from 'react-jsonschema-form'
import sdk from 'stellar-sdk'
import _ from 'lodash'

import Contracts from '../../contracts-api'
import {withServer} from '../../utils'

const schema = {
  title: 'Token - Issue a New Token',
  description: 'Issue a token on the Stellar Network',
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
          default: 'FOO',
        },
        numOfTokens: {
          type: 'integer',
          title: 'Number of Tokens',
          default: 1000,
        },
      },
    },
    accounts: {
      title: 'Accounts',
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
        signingKey: {
          type: 'string',
          title: 'Account Creation Signing Key',
        },
      },
    },
    limitFlag: {
      title: 'Limit Supply',
      type: 'object',
      properties: {
        limit: {
          type: 'boolean',
          title:
            'Limit [If checked new tokens can NOT be issued after token creation]',
          default: false,
        },
      },
    },
  },
}

// add this to the description : .&nbsp;<a href='https://www.stellar.org/developers/guides/concepts/assets.html#anchors-issuing-assets'>See details on supported formats here.</a>",
const uiSchema = {
  asset: {
    assetCode: {
      'ui:description':
        'Choose a code up to 12 character long using only alphanumeric characters. Currencies should map to an ISO 4127 code, stocks and bonds to an appropriate ISIN number',
      'ui:placeholder': 'eg. BEAN',
    },
    numOfTokens: {
      'ui:placeholder': 'Number of tokens to Issue',
    },
  },
  accounts: {
    issuingAccountKey: {
      'ui:description': 'Leave blank to have new account created ..',
      'ui:placeholder': 'Issuing account signing key (Optional)',
    },
    distAccountKey: {
      'ui:description': 'Leave blank to have new account created ..',
      'ui:placeholder': 'Distribution account signing key (Optional)',
    },
    signingKey: {
      'ui:description':
        'Secret key of an account that can create the above issuing and distribution accounts (if not provided)',
      'ui:placeholder':
        'Account creation signing key (Optional - if issuing and distribution accounts are provided)',
    },
  },
}

class Token extends React.Component {
  formValidate(formData, errors) {
    console.log(JSON.stringify(formData))
    const accs = formData.accounts

    if (!accs.signingKey && (!accs.issuingAccountKey || !accs.distAccountKey)) {
      errors.accounts.signingKey.addError(
        'Signing key is mandatory if either the issuing or distribution keys are left blank'
      )
    }

    const signKeyFields = ['signingKey', 'issuingAccountKey', 'distAccountKey']
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
    console.log(`FORM DATA: ${JSON.stringify(formData)}`)

    const tokenOpts = {
      ...formData.accounts,
      ...formData.assetDetails,
      ...formData.limitFlag,
    }

    const contracts = new Contracts(this.props.server)
    const tokenContract = contracts.token()
    tokenContract.issueToken(tokenOpts).then(tokenDetails => {
      console.log(JSON.stringify(tokenDetails))
    })
  }

  render() {
    return (
      <Form
        schema={schema}
        onSubmit={this.handleOnSubmit}
        uiSchema={uiSchema}
        validate={this.formValidate}
      />
    )
  }
}

export default withServer(Token)
