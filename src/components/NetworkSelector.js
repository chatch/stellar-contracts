import React from 'react'
import {Button} from 'react-bootstrap'
import {networks} from '../stellar'

const NetworkButton = ({network, selectedNetwork, switcher}) =>
  <Button
    bsStyle={network === selectedNetwork ? 'info' : 'default'}
    onClick={e => switcher(network)}
  >
    {network.toUpperCase()}
  </Button>

const NetworkSelector = props =>
  <div className="Network-Selector">
    {Object.keys(networks)
      .filter(network => networks[network].hide !== true)
      .map(network =>
        <NetworkButton
          key={network}
          hide={networks[network].hide}
          network={network}
          selectedNetwork={props.network}
          switcher={props.switcher}
        />
      )}
  </div>

export default NetworkSelector
