import sdk from 'stellar-sdk'

/* ----------------------------------------------------------
 *
 * Stellar networks
 *
 * ---------------------------------------------------------*/

const newServer = (address, allowHttp = false) =>
  new sdk.Server(address, {allowHttp})

const usePubnetServer = () => {
  sdk.Network.usePublicNetwork()
  return newServer(networks.public.address)
}

const useTestnetServer = () => {
  sdk.Network.useTestNetwork()
  return newServer(networks.test.address)
}

const useLocalServer = () => {
  return newServer(networks.local.address, true)
}

const networks = {
  public: {
    address: 'https://horizon.stellar.org',
    initFunc: usePubnetServer,
  },
  test: {
    address: 'https://horizon-testnet.stellar.org',
    initFunc: useTestnetServer,
  },
  local: {
    address: 'http://localhost:8000',
    initFunc: useLocalServer,
    hide: true, // from UI
  },
}

export {sdk, networks}
