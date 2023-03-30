import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Numeric } from '../../../../shared/modules/Numeric';

export default function CurrencyAssetDisplay({
  value,
  style,
  className,
  asset,
}) {
  const amountString = new Numeric(value, 16)
    .shiftedBy(asset.decimals || 2)
    .toBase(10)
    .toString();

  return (
    <div
      className={classnames('currency-display-component', className)}
      style={style}
      title="test"
    >
      <span className="currency-display-component__text">{amountString}</span>
      <span className="currency-display-component__suffix">{asset.symbol}</span>
    </div>
  );
}

CurrencyAssetDisplay.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  value: PropTypes.string.isRequired,
  asset: PropTypes.object.isRequired,
};
