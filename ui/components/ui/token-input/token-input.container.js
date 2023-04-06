import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getTokenExchangeRates, getShouldShowFiat } from '../../../selectors';
import TokenInput from './token-input.component';

const mapStateToProps = (state) => {
  const {
    metamask: { currentCurrency, tokens },
  } = state;

  return {
    currentCurrency,
    tokenExchangeRates: getTokenExchangeRates(state),
    hideConversion: !getShouldShowFiat(state),
    tokens,
  };
};

const TokenInputContainer = connect(mapStateToProps)(TokenInput);

TokenInputContainer.propTypes = {
  token: PropTypes.shape({
    provider: PropTypes.object.isRequired,
    account: PropTypes.string,
    balance: PropTypes.string,
    symbol: PropTypes.string,
  }).isRequired,
};

export default TokenInputContainer;
