import React from 'react'
import {shallow} from 'enzyme'
import {Keypair, StrKey} from 'stellar-sdk'

import AccountWithHelpersField from '../AccountWithHelpersField'

it('renders with minimal fields', () => {
  const onChange = jest.fn()
  const field = shallow(
    <AccountWithHelpersField
      formContext={{}}
      formData={{}}
      onChange={onChange}
      uiSchema={{}}
    />
  )
  expect(field.getNodes()).toMatchSnapshot()
})

it('renders placeholder', () => {
  const onChange = jest.fn()
  const placeholder = 'Enter a Stellar Secret Key'
  const field = shallow(
    <AccountWithHelpersField
      formContext={{}}
      formData={{}}
      onChange={onChange}
      uiSchema={{'ui:placeholder': placeholder}}
    />
  )
  expect(field.find('[type="text"]').prop('placeholder')).toEqual(placeholder)
  expect(field.getNodes()).toMatchSnapshot()
})

it('generate button inserts a new account', () => {
  const onChange = jest.fn()
  const field = shallow(
    <AccountWithHelpersField
      formContext={{}}
      formData={{}}
      onChange={onChange}
      uiSchema={{}}
    />
  )
  field.find('#btn-generate').simulate('click')

  const secretKey = field.find('[type="text"]').prop('value')
  expect(StrKey.isValidEd25519SecretSeed(secretKey)).toEqual(true)
  expect(onChange).toHaveBeenCalledWith({secretKey: secretKey})
})

it('use signer button inserts the signer', () => {
  const keypair = Keypair.random()
  const formCtx = {signer: keypair.secret()}
  const onChange = jest.fn()
  const field = shallow(
    <AccountWithHelpersField
      formContext={formCtx}
      formData={{}}
      onChange={onChange}
      uiSchema={{}}
    />
  )
  field.find('#btn-use-signer').simulate('click')

  const secretKey = field.find('[type="text"]').prop('value')
  expect(secretKey).toEqual(keypair.secret())
  expect(onChange).toHaveBeenCalledWith({secretKey: secretKey})
})
