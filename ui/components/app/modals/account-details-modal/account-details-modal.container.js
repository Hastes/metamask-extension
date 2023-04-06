import { connect } from 'react-redux';
import { compose } from 'redux';
import { showModal, hideModal } from '../../../../store/actions';
import {
  getSelectedIdentity,
  getRpcPrefsForCurrentProvider,
  getCurrentChainId,
  getBlockExplorerLinkText,
} from '../../../../selectors';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import AccountDetailsModal from './account-details-modal.component';

const mapStateToProps = (state) => {
  return {
    chainId: getCurrentChainId(state),
    selectedIdentity: getSelectedIdentity(state),
    keyrings: state.metamask.keyrings,
    rpcPrefs: getRpcPrefsForCurrentProvider(state),
    blockExplorerLinkText: getBlockExplorerLinkText(state, true),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showExportPrivateKeyModal: () =>
      dispatch(showModal({ name: 'EXPORT_PRIVATE_KEY' })),
    hideModal: () => {
      dispatch(hideModal());
    },
  };
};

export default compose(
  withModalProps,
  connect(mapStateToProps, mapDispatchToProps),
)(AccountDetailsModal);
