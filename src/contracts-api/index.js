import sdk from 'stellar-sdk'

import Token from './token'
import JointAccount from './joint_account'

class Contracts {
  constructor(server) {
    this.server = server
  }

  token() {
    return new Token(sdk, this.server)
  }

  jointAccount() {
    return new JointAccount(sdk, this.server)
  }
}

export default Contracts
