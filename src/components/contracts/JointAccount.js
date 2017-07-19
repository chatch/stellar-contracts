import React from 'react'
import Form from 'react-jsonschema-form'
import sdk from 'stellar-sdk'

import Contracts from '../../contracts-api'
import {withServer} from '../../utils'

const schema = {
  title: 'Joint Account',
  description:
    'Create a joint account where any member can make a payment. But ALL members are required to sign a change the member list. Add public keys of all joint account members below. The first one will be the account creator.',
  type: 'object',
  properties: {
    members: {
      title: 'Member Accounts',
      type: 'array',
      items: {
        type: 'string',
        default: '',
      },
    },
    signingKey: {
      title:
        'Signing key of the joint account creator (the 1st account in the members list above)',
      type: 'string',
    },
  },
}

const uiSchema = {
  members: {
    'ui:options': {
      orderable: false,
    },
  },
}

const formData = {
  members: ['', ''],
  signingKey: '',
}

class JointAccount extends React.Component {
  formValidate(formData, errors) {
    formData.members.forEach((member, idx) => {
      if (!sdk.StrKey.isValidEd25519PublicKey(member)) {
        errors.members[idx].addError(
          'Account is not a valid ed25519 public key'
        )
      }
    })

    if (formData.members.length <= 1) {
      errors.members.addError(
        'Need at least 2 member accounts to form a joint account'
      )
    }

    if (!sdk.StrKey.isValidEd25519SecretSeed(formData.signingKey)) {
      errors.signingKey.addError(
        'Signing key is not a valid ed25519 secret seed'
      )
    }

    return errors
  }

  handleOnSubmit = ({formData}) => {
    console.log(`FORM DATA: ${JSON.stringify(formData)}`)
    const contracts = new Contracts(this.props.server)
    const contract = contracts.jointAccount()
    contract.create(formData).then(ja => {
      console.log(JSON.stringify(ja))
    })
  }

  render() {
    return (
      <Form
        formData={formData}
        onSubmit={this.handleOnSubmit}
        schema={schema}
        uiSchema={uiSchema}
        validate={this.formValidate}
      />
    )
  }
}

export default withServer(JointAccount)
