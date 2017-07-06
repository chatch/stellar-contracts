import React from 'react'
import PropTypes from 'prop-types'

import Form from 'react-jsonschema-form'

const schema = {
  title: 'ICO - Issue a Token',
  description: 'Issue a token on the Stellar Network',
  type: 'object',
  required: ['assetCode', 'numOfTokens'],
  properties: {
    assetCode: {type: 'string', title: 'Asset Code'},
    numOfTokens: {type: 'integer', title: 'Tokens'},
    limit: {type: 'integer', title: 'Limit'},
    issuingAccount: {type: 'string', title: 'Issuing Account'},
    distAccount: {type: 'string', title: 'Distribution Account'},
  },
}

// add this to the description : .&nbsp;<a href='https://www.stellar.org/developers/guides/concepts/assets.html#anchors-issuing-assets'>See details on supported formats here.</a>",
const uiSchema = {
  assetCode: {
    'ui:description': '4 or 12 character asset code',
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
  render() {
    return <Form schema={schema} uiSchema={uiSchema} />
  }
}

export default ICO
