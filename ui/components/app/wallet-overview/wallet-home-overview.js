import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';

import { I18nContext } from '../../../contexts/i18n';
import {
  BUILD_QUOTE_ROUTE,
  IMPORT_TOKEN_ROUTE,
} from '../../../helpers/constants/routes';
import Tooltip from '../../ui/tooltip';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import { SECONDARY } from '../../../helpers/constants/common';
import {
  isBalanceCached,
  getShouldShowFiat,
  getCurrentKeyring,
  getSwapsDefaultToken,
  getSelectedAccountCachedBalance,
} from '../../../selectors';
import { setSwapsFromToken } from '../../../ducks/swaps/swaps';
import IconButton from '../../ui/icon-button';
import { isHardwareKeyring } from '../../../helpers/utils/hardware';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';
import { Icon, ICON_NAMES } from '../../component-library';
import { IconColor } from '../../../helpers/constants/design-system';
import WalletOverview from './wallet-overview';

const WalletHomeOverview = ({ className }) => {
  const dispatch = useDispatch();
  const t = useContext(I18nContext);
  const trackEvent = useContext(MetaMetricsContext);
  const history = useHistory();
  const keyring = useSelector(getCurrentKeyring);
  const usingHardwareWallet = isHardwareKeyring(keyring?.type);
  const balanceIsCached = useSelector(isBalanceCached);
  const showFiat = useSelector(getShouldShowFiat);
  const balance = useSelector(getSelectedAccountCachedBalance);
  const defaultSwapsToken = useSelector(getSwapsDefaultToken);

  return (
    <WalletOverview
      loading={!balance}
      balance={
        <Tooltip
          position="top"
          title={t('balanceOutdated')}
          disabled={!balanceIsCached}
        >
          <div className="eth-overview__balance">
            {showFiat && balance && (
              <UserPreferencedCurrencyDisplay
                className={classnames({
                  'eth-overview__cached-secondary-balance': balanceIsCached,
                  'eth-overview__secondary-balance': !balanceIsCached,
                })}
                data-testid="eth-overview__secondary-currency"
                value={balance}
                type={SECONDARY}
                ethNumberOfDecimals={4}
                hideTitle
              />
            )}
          </div>
        </Tooltip>
      }
      buttons={
        <>
          <IconButton
            className="eth-overview__button"
            Icon={
              <Icon name={ICON_NAMES.ADD} color={IconColor.primaryInverse} />
            }
            label={t('tokens')}
            onClick={() => {
              history.push(IMPORT_TOKEN_ROUTE);
              trackEvent({
                event: EVENT_NAMES.TOKEN_IMPORT_BUTTON_CLICKED,
                category: EVENT.CATEGORIES.NAVIGATION,
                properties: {
                  location: 'Home',
                },
              });
            }}
          />
          <IconButton
            className="eth-overview__button"
            Icon={
              <Icon
                name={ICON_NAMES.SWAP_HORIZONTAL}
                color={IconColor.primaryInverse}
              />
            }
            onClick={() => {
              trackEvent({
                event: EVENT_NAMES.NAV_SWAP_BUTTON_CLICKED,
                category: EVENT.CATEGORIES.SWAPS,
                properties: {
                  location: EVENT.SOURCE.SWAPS.MAIN_VIEW,
                  text: 'Exchange',
                },
              });
              dispatch(setSwapsFromToken(defaultSwapsToken));
              if (usingHardwareWallet) {
                global.platform.openExtensionInBrowser(BUILD_QUOTE_ROUTE);
              } else {
                history.push(BUILD_QUOTE_ROUTE);
              }
            }}
            label={t('exchange')}
          />
        </>
      }
      className={className}
    />
  );
};

WalletHomeOverview.propTypes = {
  className: PropTypes.string,
};

WalletHomeOverview.defaultProps = {
  className: undefined,
};

export default WalletHomeOverview;
