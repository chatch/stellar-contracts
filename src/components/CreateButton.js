import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'react-bootstrap'
import Spinner from './Spinner'

/**
 * Create button with:
 *  - loading spinner
 *  - error message
 */
const CreateButton = ({errorMsg, isLoading}) =>
  <span>
    <Button bsStyle="primary" type="submit">
      Create Contract
    </Button>
    <span style={{marginLeft: 20}}>
      {isLoading === true && <Spinner />}
      {errorMsg &&
        errorMsg != null &&
        <span style={{color: '#A94442'}}>
          Creation failed: {errorMsg}
        </span>}
    </span>
  </span>

CreateButton.propTypes = {
  errorMsg: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
}

export default CreateButton
