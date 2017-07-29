import React from 'react'
import Form from 'react-jsonschema-form'
import {Button} from 'react-bootstrap'
import sdk from 'stellar-sdk'

import Contracts from '../../api'
import {withServer, withSigner} from '../../utils'

const schema = {
  title: 'M of N Signers',
  description:
    'Setup M of N Signers on an account. Leave account blank to create a new one.',
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
    numSignersLow: {
      title: 'Num signers required to pass low threshold',
      type: 'number',
    },
    numSignersMed: {
      title: 'Num signers required to pass medium threshold',
      type: 'number',
    },
    numSignersHigh: {
      title: 'Num signers required to pass high threshold',
      type: 'number',
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

class MofNSigners extends React.Component {
  state = {}

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
        'Need at least 2 member accounts to form an M of N signers account'
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
    const contract = contracts.mOfNSigners()
    contract.create(formData).then(createRsp => {
      console.log(JSON.stringify(createRsp))
      this.setState({receipt: createRsp})
    })
  }

  render() {
    return (
      <div>
        <Form
          formData={formData}
          onSubmit={this.handleOnSubmit}
          schema={schema}
          uiSchema={uiSchema}
          validate={this.formValidate}
        >
          <Button bsStyle="info" type="submit">
            Create
          </Button>
        </Form>
        {this.state.receipt &&
          <div id="receipt">
            {this.state.receipt}
          </div>}
      </div>
    )
  }
}

export default withServer(withSigner(MofNSigners))
