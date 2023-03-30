import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import {
  getSelectedIdentity,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  getUnreadNotificationsCount,
  ///: END:ONLY_INCLUDE_IN
} from '../../../selectors';

import WalletDisplay from './wallet-display.component';

function mapStateToProps(state) {
  const {
    metamask: { isAccountMenuOpen },
  } = state;
  const selectedIdentity = getSelectedIdentity(state);
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  const unreadNotificationsCount = getUnreadNotificationsCount(state);
  ///: END:ONLY_INCLUDE_IN
  return {
    isAccountMenuOpen,
    selectedIdentity,
    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    unreadNotificationsCount,
    ///: END:ONLY_INCLUDE_IN
  };
}

export default compose(withRouter, connect(mapStateToProps))(WalletDisplay);
