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

export {storageInit}
