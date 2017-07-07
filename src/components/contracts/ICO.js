import React from 'react'
import Form from 'react-jsonschema-form'

import {withServer} from '../../utils'
import contracts from '../../contracts-api'
const icoContract = contracts.ico

const schema = {
  title: 'ICO - Issue a New Token',
  description: 'Issue a token on the Stellar Network',
  type: 'object',
  required: ['assetCode', 'numOfTokens'],
  properties: {
    assetCode: {type: 'string', title: 'Asset Code', maxLength: 12},
    numOfTokens: {type: 'integer', title: 'Tokens'},
    limit: {type: 'integer', title: 'Limit'},
    issuingAccount: {type: 'string', title: 'Issuing Account'},
    distAccount: {type: 'string', title: 'Distribution Account'},
  },
}

// add this to the description : .&nbsp;<a href='https://www.stellar.org/developers/guides/concepts/assets.html#anchors-issuing-assets'>See details on supported formats here.</a>",
const uiSchema = {
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
  issuingAccount: {
    'ui:description': 'Leave blank to have new account created ..',
    'ui:placeholder': 'Issuing account (Optional)',
  },
  distAccount: {
    'ui:description': 'Leave blank to have new account created ..',
    'ui:placeholder': 'Distribution account (Optional)',
  },
}

class ICO extends React.Component {
  handleOnSubmit = ({formData}) => {
    console.log(`FORM DATA: ${JSON.stringify(formData)}`)
    console.log(`Server network: ${this.props.server.serverURL}`)
    icoContract(this.props.server, formData)
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

export default withServer(ICO)
