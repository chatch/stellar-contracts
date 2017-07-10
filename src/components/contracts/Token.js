import React from 'react'
import Form from 'react-jsonschema-form'

import Contracts from '../../contracts-api'
import {withServer} from '../../utils'

const schema = {
  title: 'Token - Issue a New Token',
  description: 'Issue a token on the Stellar Network',
  type: 'object',
  required: ['assetCode', 'numOfTokens'],
  properties: {
    signingKey: {
      type: 'string',
      title: 'Signing Key',
      default: 'SCFAND6HGP7RVS6JLDSWINBOC6D3DYEEKY3FPTUUT5SEMTBQODK4FIR7',
    },
    assetCode: {
      type: 'string',
      title: 'Asset Code',
      maxLength: 12,
      default: 'FOO',
    },
    numOfTokens: {type: 'integer', title: 'Number of Tokens', default: 1000},
    limit: {type: 'integer', title: 'Limit'},
    issuingAccountKey: {
      type: 'string',
      title: 'Issuing Account Signing Key',
      default: 'SC5RUHYP65MGKQEITLHLLOHBLRYEDNHXNRVBHIPPJWHBBXWPPCKYSZPW',
    },
    distAccountKey: {
      type: 'string',
      title: 'Distribution Account Signing Key',
      default: 'SC4ZBXYD5JRMUYM6VVEC7GPJSQYFS2XHSAIIBN4IXNWPXV3GJWSIHJSF',
    },
  },
}

// add this to the description : .&nbsp;<a href='https://www.stellar.org/developers/guides/concepts/assets.html#anchors-issuing-assets'>See details on supported formats here.</a>",
const uiSchema = {
  signingKey: {
    'ui:description':
      "Secret key of account to creating issuing and/or dist accounts in the case these aren't provided",
    'ui:placeholder': 'Signer Secret Key',
  },
  assetCode: {
    'ui:description':
      'Choose a code up to 12 character long using only alphanumeric characters. Currencies should map to an ISO 4127 code, stocks and bonds to an appropriate ISIN number',
    'ui:placeholder': 'eg. BEAN',
  },
  numOfTokens: {
    'ui:placeholder': 'Number of tokens to Issue',
  },
  limit: {
    'ui:description':
      'You can place a hard limit on the total token supply here',
    'ui:placeholder': 'Limit token supply (Optional)',
  },
  issuingAccountKey: {
    'ui:description': 'Leave blank to have new account and key created ..',
    'ui:placeholder': 'Issuing account signing key (Optional)',
  },
  distAccountKey: {
    'ui:description': 'Leave blank to have new account and key created ..',
    'ui:placeholder': 'Distribution account signing key (Optional)',
  },
}

class Token extends React.Component {
  handleOnSubmit = ({formData}) => {
    console.log(`FORM DATA: ${JSON.stringify(formData)}`)
    console.log(`Server network: ${this.props.server.serverURL}`)

    const contracts = new Contracts(this.props.server)
    const tokenContract = contracts.token()
    tokenContract.issueToken(formData).then(tokenDetails => {
      console.log(JSON.stringify(tokenDetails))
    })
  }

  render() {
    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={this.handleOnSubmit}
      />
    )
  }
}

export default withServer(Token)
