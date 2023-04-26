import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Numeric } from '../../../../shared/modules/Numeric';

import { ChainProvider } from '../../../../app/scripts/controllers/network/chain-provider';

export default function CurrencyAssetDisplay({
  value,
  style,
  className,
  provider,
  native,
}) {
  const cp = new ChainProvider(provider);

  const decimals = native ? cp.nativeDecimals : cp.decimals;
  const symbol = native ? cp.nativeSymbol : cp.symbol;

  const amountString = new Numeric(value, 16)
    .shiftedBy(decimals)
    .toBase(10)
    .toString();

  return (
    <div
      className={classnames('currency-display-component', className)}
      style={style}
      title="test"
    >
      <span className="currency-display-component__text">{amountString}</span>
      <span className="currency-display-component__suffix">{symbol}</span>
    </div>
  );
}

CurrencyAssetDisplay.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  value: PropTypes.string.isRequired,
  provider: PropTypes.object.isRequired,
  native: PropTypes.bool,
};

CurrencyAssetDisplay.defaultProps = {
  native: false,
};
