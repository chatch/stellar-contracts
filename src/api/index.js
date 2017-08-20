import sdk from 'stellar-sdk'

import Token from './token'
import JointAccount from './joint_account'
import MofNSigners from './m_of_n_signers'
import ROSCARotatedSavings from './rosca_rotated_savings'

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

  mOfNSigners() {
    return new MofNSigners(sdk, this.server)
  }

  roscaRotatedSavings() {
    return new ROSCARotatedSavings(sdk, this.server)
  }
}

export default Contracts
