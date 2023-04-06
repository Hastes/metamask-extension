import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getAccountLink } from '@metamask/etherscan-link';

import AccountModalContainer from '../account-modal-container';
import QrView from '../../../ui/qr-code';
import Button from '../../../ui/button';
import { Text } from '../../../component-library';
import { getURLHostName } from '../../../../helpers/utils/util';
import { isHardwareKeyring } from '../../../../helpers/utils/hardware';
import {
  EVENT,
  EVENT_NAMES,
} from '../../../../../shared/constants/metametrics';
import { NETWORKS_ROUTE } from '../../../../helpers/constants/routes';
import { TextVariant } from '../../../../helpers/constants/design-system';

export default class AccountDetailsModal extends Component {
  static defaultProps = {
    token: null,
  };

  static propTypes = {
    selectedIdentity: PropTypes.object,
    chainId: PropTypes.string,
    showExportPrivateKeyModal: PropTypes.func,
    keyrings: PropTypes.array,
    rpcPrefs: PropTypes.object,
    history: PropTypes.object,
    hideModal: PropTypes.func,
    blockExplorerLinkText: PropTypes.object,
    token: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  render() {
    const {
      selectedIdentity,
      chainId,
      showExportPrivateKeyModal,
      keyrings,
      rpcPrefs,
      history,
      hideModal,
      blockExplorerLinkText,
      token,
    } = this.props;
    const { name } = selectedIdentity;
    let { address } = selectedIdentity;

    if (token) {
      address = token.owner;
    }

    const keyring = keyrings.find((kr) => {
      return kr.accounts.includes(address);
    });

    let exportPrivateKeyFeatureEnabled = true;
    // This feature is disabled for hardware wallets
    if (isHardwareKeyring(keyring?.type)) {
      exportPrivateKeyFeatureEnabled = false;
    }

    const routeToAddBlockExplorerUrl = () => {
      hideModal();
      history.push(`${NETWORKS_ROUTE}#blockExplorerUrl`);
    };

    const openBlockExplorer = () => {
      const accountLink = getAccountLink(address, chainId, rpcPrefs);
      this.context.trackEvent({
        category: EVENT.CATEGORIES.NAVIGATION,
        event: EVENT_NAMES.EXTERNAL_LINK_CLICKED,
        properties: {
          link_type: EVENT.EXTERNAL_LINK_TYPES.ACCOUNT_TRACKER,
          location: 'Account Details Modal',
          url_domain: getURLHostName(accountLink),
        },
      });
      global.platform.openTab({
        url: accountLink,
      });
    };

    return (
      <AccountModalContainer
        image={token?.image}
        className="account-details-modal"
      >
        <Text variant={TextVariant.bodyLgMedium} as="p" marginBottom={5}>
          {name}
        </Text>

        <QrView
          Qr={{
            data: address,
          }}
        />

        <div className="account-details-modal__divider" />

        <Button
          type="secondary"
          className="account-details-modal__button"
          onClick={
            blockExplorerLinkText.firstPart === 'addBlockExplorer'
              ? routeToAddBlockExplorerUrl
              : openBlockExplorer
          }
        >
          {this.context.t(blockExplorerLinkText.firstPart, [
            blockExplorerLinkText.secondPart,
          ])}
        </Button>

        {exportPrivateKeyFeatureEnabled && (
          <Button
            type="secondary"
            className="account-details-modal__button"
            onClick={() => {
              this.context.trackEvent({
                category: EVENT.CATEGORIES.ACCOUNTS,
                event: EVENT_NAMES.KEY_EXPORT_SELECTED,
                properties: {
                  key_type: EVENT.KEY_TYPES.PKEY,
                  location: 'Account Details Modal',
                },
              });
              showExportPrivateKeyModal();
            }}
          >
            {this.context.t('exportPrivateKey')}
          </Button>
        )}
      </AccountModalContainer>
    );
  }
}
