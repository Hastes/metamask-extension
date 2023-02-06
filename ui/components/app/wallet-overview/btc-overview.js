import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import CurrencyDisplay from '../../ui/currency-display';
import TextField from '../../ui/text-field';
import Button from '../../ui/button';

class BtcOverview extends Component {
  static propTypes = {
    className: PropTypes.string,
    icon: PropTypes.element,
    loading: PropTypes.bool,
    btcSend: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.props = props;
  }

  state = {
    address: '',
    errorAddress: null,
  };

  handleChange = (e) => {
    const val = e.target.value;
    const addressIsValid = /^[a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(val);
    this.setState({ address: val });
    if (addressIsValid) {
      this.setState({ errorAddress: null });
    } else {
      this.setState({
        errorAddress: 'A bitcoin address is a 26-35 alphanumeric character',
      });
    }
    // this.setSearchQuery(val);
  };

  btcSend() {
    this.props.btcSend(this.state.address, 1);
  }

  render() {
    const { address, errorAddress } = this.state;

    return (
      <div className={classnames('wallet-overview', this.props.className)}>
        <div className="wallet-overview__balance">
          {this.props.loading ? null : this.props.icon}
          <div className="token-overview__balance">
            <CurrencyDisplay
              className="token-overview__primary-balance"
              displayValue="0"
              suffix="BTC"
            />
          </div>
        </div>
        <div className="wallet-overview__buttons">
          <TextField
            placeholder="Input Token Address"
            type="text"
            value={address}
            onChange={(e) => this.handleChange(e)}
            error={errorAddress}
            fullWidth
            autoFocus
            autoComplete="off"
          />
        </div>
        <div>
          {!errorAddress && address ? (
            <Button
              onClick={() => {
                this.btcSend();
              }}
            >
              Send Satoshis
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
}

export default BtcOverview;
