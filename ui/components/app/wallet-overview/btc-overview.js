import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import CurrencyDisplay from '../../ui/currency-display';

const BtcOverview = ({ className, icon, loading }) => {
  return (
    <div className={classnames('wallet-overview', className)}>
      <div className="wallet-overview__balance">
        {loading ? null : icon}
        <div className="token-overview__balance">
          <CurrencyDisplay
            className="token-overview__primary-balance"
            displayValue="0"
            suffix="BTC"
          />
        </div>
      </div>
      <div className="wallet-overview__buttons"></div>
    </div>
  );
};

BtcOverview.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.element.isRequired,
  loading: PropTypes.bool,
};

BtcOverview.defaultProps = {
  className: undefined,
};

export default BtcOverview;
