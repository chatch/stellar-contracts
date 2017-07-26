import PropTypes from 'prop-types'
import {getContext} from 'recompose'

const storageInit = () => {
  let storage
  if (typeof localStorage === 'undefined' || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage
    storage = new LocalStorage('./stellarexplorer')
  } else {
    storage = localStorage
  }
  return storage
}

// @see App.js which puts this stellar server handle on the context
const withServer = getContext({server: PropTypes.object})
const withSigner = getContext({signer: PropTypes.string})

export {storageInit, withServer, withSigner}
