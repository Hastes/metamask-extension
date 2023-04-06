import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import AssetListItem from '../asset-list-item';
import { getSelectedAddress } from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenFiatAmount } from '../../../hooks/useTokenFiatAmount';

export default function TokenCell({
  owner,
  contract, // contract address
  provider,
  image,
  decimals,
  balance,
  balanceError,
  symbol,
  string,
  onClick,
  isERC721,
}) {
  const userAddress = useSelector(getSelectedAddress);
  const t = useI18nContext();

  const formattedFiat = useTokenFiatAmount(contract, string, symbol);
  const warning = balanceError ? (
    <span>
      {t('troubleTokenBalances')}
      <a
        href={`https://ethplorer.io/address/${userAddress}`}
        rel="noopener noreferrer"
        target="_blank"
        onClick={(event) => event.stopPropagation()}
        style={{ color: 'var(--color-warning-default)' }}
      >
        {t('here')}
      </a>
    </span>
  ) : null;
  return (
    <AssetListItem
      onClick={onClick}
      className={classnames('token-cell', {
        'token-cell--outdated': Boolean(balanceError),
      })}
      iconClassName="token-cell__icon"
      tokenProvider={provider}
      tokenContract={contract}
      tokenBalance={balance}
      tokenAddress={owner}
      tokenSymbol={symbol}
      tokenDecimals={decimals}
      tokenImage={image}
      warning={warning}
      primary={`${string || 0}`}
      secondary={formattedFiat}
      isERC721={isERC721}
    />
  );
}

TokenCell.propTypes = {
  provider: PropTypes.object,
  contract: PropTypes.string,
  owner: PropTypes.string,
  image: PropTypes.string,
  balance: PropTypes.string,
  balanceError: PropTypes.object,
  symbol: PropTypes.string,
  decimals: PropTypes.number,
  string: PropTypes.string,
  onClick: PropTypes.func,
  isERC721: PropTypes.bool,
};

TokenCell.defaultProps = {
  balanceError: null,
  contract: null,
  image: null,
  provider: null,
  onClick: null,
};
