import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TokenInput from '../../ui/token-input';

export default class UserPreferencedTokenInput extends PureComponent {
  static propTypes = {
    token: PropTypes.shape({
      provider: PropTypes.object.isRequired,
      account: PropTypes.string,
      balance: PropTypes.string,
      symbol: PropTypes.string,
    }).isRequired,
    useNativeCurrencyAsPrimaryCurrency: PropTypes.bool,
  };

  render() {
    const { useNativeCurrencyAsPrimaryCurrency, ...restProps } = this.props;

    return (
      <TokenInput
        {...restProps}
        showFiat={!useNativeCurrencyAsPrimaryCurrency}
      />
    );
  }
}
