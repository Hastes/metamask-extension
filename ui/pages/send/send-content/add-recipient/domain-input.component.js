import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { addHexPrefix } from '../../../../../app/scripts/lib/util';
import { isValidDomainName } from '../../../../helpers/utils/util';
import {
  isBurnAddress,
  isValidHexAddress,
} from '../../../../../shared/modules/hexstring-utils';
import {
  ButtonIcon,
  Icon,
  ICON_NAMES,
  ICON_SIZES,
} from '../../../../components/component-library';
import { IconColor } from '../../../../helpers/constants/design-system';
import { NETWORK_TYPES } from '../../../../../shared/constants/network';
import { chainTron } from '../../../../../app/scripts/controllers/network/chain-provider';

export default class DomainInput extends Component {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  static propTypes = {
    className: PropTypes.string,
    selectedAddress: PropTypes.string,
    selectedName: PropTypes.string,
    scanQrCode: PropTypes.func,
    onPaste: PropTypes.func,
    onValidAddressTyped: PropTypes.func,
    internalSearch: PropTypes.bool,
    userInput: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    lookupEnsName: PropTypes.func.isRequired,
    initializeDomainSlice: PropTypes.func.isRequired,
    resetDomainResolution: PropTypes.func.isRequired,
    sendAsset: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.props.initializeDomainSlice();
  }

  onPaste = (event) => {
    if (event.clipboardData.items?.length) {
      const clipboardItem = event.clipboardData.items[0];
      clipboardItem?.getAsString((text) => {
        const input = text.trim();
        if (
          !isBurnAddress(input) &&
          isValidHexAddress(input, { mixedCaseUseChecksum: true })
        ) {
          this.props.onPaste(addHexPrefix(input));
        }
      });
    }
  };

  onChange = ({ target: { value } }) => {
    const {
      onValidAddressTyped,
      internalSearch,
      onChange,
      lookupEnsName,
      resetDomainResolution,
      sendAsset,
    } = this.props;
    console.log(sendAsset);
    const input = value.trim();

    const ERC20Validator = () =>
      isValidHexAddress(input, {
        mixedCaseUseChecksum: true,
      });

    const VALIDATION_BY_NETWORK = {
      [NETWORK_TYPES.MAINNET]: ERC20Validator,
      [NETWORK_TYPES.RPC]: ERC20Validator,
      [NETWORK_TYPES.TRON]: () => chainTron.isAddress(input),
    };

    const validateFunc =
      VALIDATION_BY_NETWORK[sendAsset.details.provider.type] || ERC20Validator;

    onChange(input);
    if (internalSearch) {
      return null;
    }
    // Empty ENS state if input is empty
    // maybe scan ENS
    if (isValidDomainName(input)) {
      lookupEnsName(input);
    } else {
      resetDomainResolution();
      if (onValidAddressTyped && !isBurnAddress(input) && validateFunc()) {
        onValidAddressTyped(input);
      }
    }

    return null;
  };

  render() {
    const { t } = this.context;
    const { className, selectedAddress, selectedName, userInput } = this.props;

    const hasSelectedAddress = Boolean(selectedAddress);

    return (
      <div className={classnames('ens-input', className)}>
        <div
          className={classnames('ens-input__wrapper', {
            'ens-input__wrapper__status-icon--error': false,
            'ens-input__wrapper__status-icon--valid': false,
            'ens-input__wrapper--valid': hasSelectedAddress,
          })}
        >
          {hasSelectedAddress ? (
            <Icon
              className="ens-input__wrapper__status-icon"
              name={ICON_NAMES.CHECK}
              color={IconColor.successDefault}
            />
          ) : (
            <Icon
              name={ICON_NAMES.SEARCH}
              color={IconColor.iconMuted}
              className="ens-input__wrapper__status-icon"
            />
          )}
          {hasSelectedAddress ? (
            <>
              <div className="ens-input__wrapper__input ens-input__wrapper__input--selected">
                <div className="ens-input__selected-input__title">
                  {selectedName || selectedAddress}
                </div>
                {selectedName !== selectedAddress && (
                  <div className="ens-input__selected-input__subtitle">
                    {selectedAddress}
                  </div>
                )}
              </div>
              <ButtonIcon
                iconName={ICON_NAMES.CLOSE}
                ariaLabel={t('close')}
                onClick={this.props.onReset}
                className="ens-input__wrapper__action-icon-button"
                size={ICON_SIZES.SM}
              />
            </>
          ) : (
            <>
              <input
                className="ens-input__wrapper__input"
                type="text"
                dir="auto"
                placeholder={t('recipientAddressPlaceholder')}
                onChange={this.onChange}
                onPaste={this.onPaste}
                spellCheck="false"
                value={selectedAddress || userInput}
                autoFocus
                data-testid="ens-input"
              />
              <ButtonIcon
                className="ens-input__wrapper__action-icon-button"
                onClick={() => {
                  if (userInput) {
                    this.props.onReset();
                  } else {
                    this.props.scanQrCode();
                  }
                }}
                iconName={
                  userInput ? ICON_NAMES.CLOSE : ICON_NAMES.SCAN_BARCODE
                }
                ariaLabel={t(userInput ? 'close' : 'scanQrCode')}
                color={
                  userInput ? IconColor.iconDefault : IconColor.primaryDefault
                }
              />
            </>
          )}
        </div>
      </div>
    );
  }
}
