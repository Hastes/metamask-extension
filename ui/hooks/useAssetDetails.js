import { isEqual } from 'lodash';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNfts, getTokens } from '../ducks/metamask/metamask';
import { ChainProvider } from '../../app/scripts/controllers/network/chain-provider';
import { usePrevious } from './usePrevious';
import { useTokenTracker } from './useTokenTracker';

export function useAssetDetails(
  tokenAddress,
  userAddress,
  transactionData,
  provider,
) {
  const dispatch = useDispatch();
  // state selectors
  const nfts = useSelector(getNfts);
  const tokens = useSelector(getTokens, isEqual);
  const currentToken = tokens.find((token) =>
    isEqual(token.provider, provider),
  );

  // in-hook state
  const [currentAsset, setCurrentAsset] = useState(null);
  const { tokensWithBalances } = useTokenTracker(
    currentToken ? [currentToken] : [],
  );

  // previous state checkers
  const prevTokenAddress = usePrevious(tokenAddress);
  const prevUserAddress = usePrevious(userAddress);
  const prevTransactionData = usePrevious(transactionData);
  const prevTokenBalance = usePrevious(tokensWithBalances);

  useEffect(() => {
    async function getAndSetAssetDetails() {
      const cp = new ChainProvider(provider);
      const { toAddress, tokenAmount, tokenId } =
        cp.parseTokenTransferData(transactionData);
      // Do we need user balance?
      // dispatch(showLoadingIndication))
      // const balance = await cp.getBalance(userAddress);
      setCurrentAsset({
        toAddress,
        tokenAmount,
        tokenId,
        decimals: cp.decimals,
        image: cp.iconUrl,
        symbol: cp.symbol,
        standard: cp.getStandard(),
        nativeCurrency: cp.nativeSymbol,
      });
    }
    if (
      tokenAddress !== prevTokenAddress ||
      userAddress !== prevUserAddress ||
      transactionData !== prevTransactionData ||
      (prevTokenBalance && prevTokenBalance !== tokensWithBalances)
    ) {
      getAndSetAssetDetails();
    }
  }, [
    dispatch,
    prevTokenAddress,
    prevTransactionData,
    prevUserAddress,
    tokenAddress,
    userAddress,
    transactionData,
    nfts,
    tokensWithBalances,
    prevTokenBalance,
    provider,
  ]);

  if (currentAsset) {
    const {
      standard,
      symbol,
      image,
      tokenId,
      toAddress,
      tokenAmount,
      decimals,
      nativeCurrency,
    } = currentAsset;

    return {
      toAddress,
      tokenId,
      decimals,
      tokenAmount: tokenAmount.toString(),
      assetAddress: tokenAddress,
      assetStandard: standard,
      tokenSymbol: symbol ?? '',
      tokenImage: image,
      nativeCurrency,
    };
  }

  return {};
}
