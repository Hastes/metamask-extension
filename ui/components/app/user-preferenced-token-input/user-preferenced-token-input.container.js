import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getPreferences } from '../../../selectors';
import UserPreferencedTokenInput from './user-preferenced-token-input.component';

const mapStateToProps = (state) => {
  const { useNativeCurrencyAsPrimaryCurrency } = getPreferences(state);

  return {
    useNativeCurrencyAsPrimaryCurrency,
  };
};

const UserPreferencedTokenInputContainer = connect(mapStateToProps)(
  UserPreferencedTokenInput,
);

UserPreferencedTokenInputContainer.propTypes = {
  token: PropTypes.shape({
    provider: PropTypes.object.isRequired,
    account: PropTypes.string,
    balance: PropTypes.string,
    symbol: PropTypes.string,
  }).isRequired,
};

export default UserPreferencedTokenInputContainer;
