import React from 'react'
import PropTypes from 'prop-types'
import {Button, Modal} from 'react-bootstrap'
import CopyToClipboard from 'react-copy-to-clipboard'
import JSONPretty from 'react-json-pretty'

const ClipboardCopyButton = ({copied, handleOnClickCopy, receipt}) => (
  <CopyToClipboard text={receipt} onCopy={handleOnClickCopy}>
    <span>
      <Button bsStyle="primary">Copy to Clipboard</Button>
      {copied && <span style={{marginLeft: 5}}>Copied!</span>}
    </span>
  </CopyToClipboard>
)

const ReceiptModal = ({
  copied,
  handleOnClickClose,
  handleOnClickCopy,
  receipt,
  showModal,
}) => (
  <Modal show={showModal} onHide={handleOnClickClose}>
    <Modal.Header closeButton>
      <Modal.Title>Contract Receipt</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{marginBottom: 15}}>
        <ClipboardCopyButton
          copied={copied}
          handleOnClickCopy={handleOnClickCopy}
          receipt={receipt}
        />
      </div>
      <JSONPretty id="json-pretty" json={receipt} />
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleOnClickClose}>Close</Button>
    </Modal.Footer>
  </Modal>
)

class Receipt extends React.Component {
  state = {copied: false, showModal: true}

  handleOnClickClose = () => {
    this.setState({showModal: false})
  }

  handleOnClickCopy = () => {
    this.setState({copied: true})
  }

  render() {
    return (
      <ReceiptModal
        copied={this.state.copied}
        handleOnClickClose={this.handleOnClickClose}
        handleOnClickCopy={this.handleOnClickCopy}
        receipt={JSON.stringify(this.props.receipt, null, 2)}
        showModal={this.state.showModal}
      />
    )
  }
}

Receipt.propTypes = {
  receipt: PropTypes.object.isRequired,
}

export default Receipt
