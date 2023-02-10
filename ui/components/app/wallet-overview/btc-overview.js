import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import CurrencyDisplay from '../../ui/currency-display';
import TextField from '../../ui/text-field';
import Button from '../../ui/button';
import Typography from '../../ui/typography';
import Box from '../../ui/box';
import { COLORS, TYPOGRAPHY } from '../../../helpers/constants/design-system';

class BtcOverview extends Component {
  static propTypes = {
    className: PropTypes.string,
    icon: PropTypes.element,
    loading: PropTypes.bool,
    btcSend: PropTypes.func,
    getBtcAccount: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.props = props;
  }

  state = {
    address: 'mohjSavDdQYHRYXcS3uS6ttaHP8amyvX78',
    amount: 4000,
    errorAddress: null,
  };

  handleAddressChange = (e) => {
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

  handleAmountChange = (e) => {
    this.setState({ amount: e.target.value });
  };

  btcSend() {
    this.props.btcSend(this.state.address, Number(this.state.amount));
  }

  get btcAmount() {
    return Number(this.props.getBtcAccount.info.address.balance);
  }

  render() {
    const { address, errorAddress, amount } = this.state;

    return (
      <div className={classnames('wallet-overview', this.props.className)}>
        <div className="wallet-overview__balance">
          {this.props.loading ? null : this.props.icon}
          <div className="token-overview__balance">
            <CurrencyDisplay
              className="token-overview__primary-balance"
              displayValue={String(this.btcAmount / 10 ** 9)}
              suffix="BTC"
            />
          </div>
        </div>

        <Typography
          variant={TYPOGRAPHY.H7}
          color={COLORS.TEXT_MUTED}
          marginTop={4}
          marginBottom={3}
        >
          Send your coins
        </Typography>
        <div>
          <Box marginBottom={3}>
            <TextField
              placeholder="Input token Address"
              type="text"
              value={address}
              onChange={(e) => this.handleAddressChange(e)}
              error={errorAddress}
              fullWidth
              autoFocus
              autoComplete="off"
            />
          </Box>

          <Box marginBottom={3}>
            <TextField
              placeholder="Satoshi amount 100.000.000 = 1 BTC"
              type="number"
              value={amount}
              onChange={(e) => this.handleAmountChange(e)}
              fullWidth
              autoComplete="off"
            />
          </Box>
          {amount > this.btcAmount && (
            <Box marginBottom={3}>
              <Typography color={COLORS.ERROR_DEFAULT}>
                Not enough funds available
              </Typography>
            </Box>
          )}
        </div>
        <div>
          {amount <= this.btcAmount && !errorAddress && address ? (
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
