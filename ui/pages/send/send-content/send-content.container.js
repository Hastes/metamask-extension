import { connect } from 'react-redux';
import {
  getIsEthGasPriceFetched,
  getNoGasPriceFetched,
  checkNetworkOrAccountNotSupports1559,
} from '../../../selectors';
import {
  getIsBalanceInsufficient,
  getSendAsset,
  getAssetError,
  getRecipient,
  acknowledgeRecipientWarning,
  getRecipientWarningAcknowledgement,
  getCurrentDraftTransaction,
} from '../../../ducks/send';
import SendContent from './send-content.component';

function mapStateToProps(state) {
  const recipient = getRecipient(state);
  const recipientWarningAcknowledged =
    getRecipientWarningAcknowledgement(state);
  const tx = getCurrentDraftTransaction(state);

  return {
    // isEthGasPrice: getIsEthGasPriceFetched(state),
    isEthGasPrice: false,
    noGasPrice: getNoGasPriceFetched(state),
    networkOrAccountNotSupports1559: !tx.eip1559support,
    getIsBalanceInsufficient: getIsBalanceInsufficient(state),
    asset: getSendAsset(state),
    assetError: getAssetError(state),
    recipient,
    recipientWarningAcknowledged,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    acknowledgeRecipientWarning: () => dispatch(acknowledgeRecipientWarning()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendContent);
