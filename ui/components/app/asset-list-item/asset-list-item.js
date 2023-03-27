import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';

import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Identicon from '../../ui/identicon';
import ListItem from '../../ui/list-item';
import Tooltip from '../../ui/tooltip';
import InfoIcon from '../../ui/icon/info-icon.component';
import Button from '../../ui/button';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { startNewDraftTransaction } from '../../../ducks/send';
import { SEND_ROUTE } from '../../../helpers/constants/routes';
import { SEVERITIES } from '../../../helpers/constants/design-system';
import { INVALID_ASSET_TYPE } from '../../../helpers/constants/error-keys';
import { EVENT } from '../../../../shared/constants/metametrics';
import { CHAIN_ALIASES } from '../../../../shared/constants/network';
import { AssetType } from '../../../../shared/constants/transaction';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { shortenAddress } from '../../../helpers/utils/util';

const AssetListItem = ({
  className,
  'data-testid': dataTestId,
  iconClassName,
  onClick,
  tokenProvider,
  tokenBalance,
  tokenAddress,
  tokenContract,
  tokenSymbol,
  tokenDecimals,
  tokenImage,
  warning,
  primary,
  secondary,
  identiconBorder,
  isERC721,
}) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEvent = useContext(MetaMetricsContext);
  const titleIcon = warning ? (
    <Tooltip
      wrapperClassName="asset-list-item__warning-tooltip"
      interactive
      position="bottom"
      html={warning}
    >
      <InfoIcon severity={SEVERITIES.WARNING} />
    </Tooltip>
  ) : null;

  const midContent = warning ? (
    <>
      <InfoIcon severity={SEVERITIES.WARNING} />
      <div className="asset-list-item__warning">{warning}</div>
    </>
  ) : null;

  const sendTokenButton = useMemo(() => {
    if (tokenAddress === null || tokenAddress === undefined) {
      return null;
    }
    return (
      <Button
        type="link"
        className="asset-list-item__send-token-button"
        onClick={async (e) => {
          e.stopPropagation();
          trackEvent({
            event: 'Clicked Send: Token',
            category: EVENT.CATEGORIES.NAVIGATION,
            properties: {
              action: 'Home',
              legacy_event: true,
            },
          });
          try {
            await dispatch(
              startNewDraftTransaction({
                type: AssetType.native,
                details: {
                  provider: tokenProvider,
                  balance: tokenBalance,
                  account: tokenAddress,
                  contract: tokenContract,
                  decimals: tokenDecimals,
                  symbol: tokenSymbol,
                },
              }),
            );
            history.push(SEND_ROUTE);
          } catch (err) {
            if (!err.message.includes(INVALID_ASSET_TYPE)) {
              throw err;
            }
          }
        }}
      >
        {t('sendSpecifiedTokens', [tokenSymbol])}
      </Button>
    );
  }, [
    tokenContract,
    tokenBalance,
    tokenSymbol,
    trackEvent,
    tokenAddress,
    tokenDecimals,
    history,
    t,
    dispatch,
    tokenProvider,
  ]);
  const clickRow = () => {
    copyToClipboard(tokenAddress);
    onClick();
  };

  return (
    <ListItem
      className={classnames('asset-list-item', className)}
      data-testid={dataTestId}
      title={
        <button
          className="asset-list-item__token-button"
          data-testid="token-button"
          onClick={clickRow}
          title={`${primary} ${tokenSymbol}`}
        >
          <h2>
            <span className="asset-list-item__token-value">{primary}</span>
            <span className="asset-list-item__token-symbol">{tokenSymbol}</span>
            <span className="asset-list-item__token-type">
              {tokenProvider && CHAIN_ALIASES[tokenProvider.chainId]}
            </span>
          </h2>
        </button>
      }
      titleIcon={titleIcon}
      subtitle={
        <div>
          <div className="asset-list-item__token-address">
            {shortenAddress(tokenAddress)}
          </div>

          {secondary ? <h3 title={secondary}>{secondary}</h3> : null}
        </div>
      }
      onClick={onClick}
      icon={
        <Identicon
          className={iconClassName}
          diameter={32}
          address={tokenAddress}
          image={tokenImage}
          alt={`${primary} ${tokenSymbol}`}
          imageBorder={identiconBorder}
        />
      }
      midContent={midContent}
      rightContent={!isERC721 && sendTokenButton}
    />
  );
};

AssetListItem.propTypes = {
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  tokenAddress: PropTypes.string,
  tokenSymbol: PropTypes.string,
  tokenDecimals: PropTypes.number,
  tokenBalance: PropTypes.string,
  tokenContract: PropTypes.string,
  tokenProvider: PropTypes.object,
  tokenImage: PropTypes.string,
  warning: PropTypes.node,
  primary: PropTypes.string,
  secondary: PropTypes.string,
  identiconBorder: PropTypes.bool,
  isERC721: PropTypes.bool,
};

AssetListItem.defaultProps = {
  className: undefined,
  'data-testid': undefined,
  iconClassName: undefined,
  tokenImage: undefined,
  warning: undefined,
  tokenContract: undefined,
  tokenProvider: undefined,
};

export default AssetListItem;
