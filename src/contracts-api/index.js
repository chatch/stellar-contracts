import Token from './token'
import sdk from 'stellar-sdk'

class Contracts {
  constructor(server) {
    this.server = server
  }

  token() {
    return new Token(sdk, this.server)
  }
}

export default Contracts
