import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TokenList from '../token-list';
import AssetListItem from '../asset-list-item';
import { showModal } from '../../../store/actions';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import { useUserPreferencedCurrency } from '../../../hooks/useUserPreferencedCurrency';
import { CHAIN_IDS, NETWORK_TYPES } from '../../../../shared/constants/network';
import {
  getSelectedAccountCachedBalance,
  getShouldShowFiat,
  getNativeCurrencyImage,
  getDetectedTokensInCurrentNetwork,
  getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
  getSelectedAccount,
} from '../../../selectors';
import { useCurrencyDisplay } from '../../../hooks/useCurrencyDisplay';

import DetectedToken from '../detected-token/detected-token';
import DetectedTokensLink from './detetcted-tokens-link/detected-tokens-link';

const AssetList = () => {
  const [showDetectedTokens, setShowDetectedTokens] = useState(false);

  const selectedAccountBalance = useSelector(getSelectedAccountCachedBalance);
  const selectedAccount = useSelector(getSelectedAccount);

  const showFiat = useSelector(getShouldShowFiat);

  const balance = useSelector(getSelectedAccountCachedBalance);
  const balanceIsLoading = !balance;

  const ethProviderConfig = {
    type: NETWORK_TYPES.MAINNET,
    chainId: CHAIN_IDS.MAINNET,
  };

  const {
    currency: primaryCurrency,
    numberOfDecimals: primaryNumberOfDecimals,
  } = useUserPreferencedCurrency(PRIMARY, { ethNumberOfDecimals: 4 });
  const {
    currency: secondaryCurrency,
    numberOfDecimals: secondaryNumberOfDecimals,
  } = useUserPreferencedCurrency(SECONDARY, { ethNumberOfDecimals: 4 });

  const [, primaryCurrencyProperties] = useCurrencyDisplay(
    selectedAccountBalance,
    {
      numberOfDecimals: primaryNumberOfDecimals,
      currency: primaryCurrency,
    },
  );

  const [secondaryCurrencyDisplay, secondaryCurrencyProperties] =
    useCurrencyDisplay(selectedAccountBalance, {
      numberOfDecimals: secondaryNumberOfDecimals,
      currency: secondaryCurrency,
    });

  const primaryTokenImage = useSelector(getNativeCurrencyImage);
  const detectedTokens = useSelector(getDetectedTokensInCurrentNetwork) || [];
  const istokenDetectionInactiveOnNonMainnetSupportedNetwork = useSelector(
    getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
  );
  const dispatch = useDispatch(false);

  return (
    <>
      <AssetListItem
        onClick={() => dispatch(showModal({ name: 'ACCOUNT_DETAILS' }))}
        data-testid="wallet-balance"
        primary={
          primaryCurrencyProperties.value ?? secondaryCurrencyProperties.value
        }
        tokenProvider={ethProviderConfig}
        tokenAddress={selectedAccount.address}
        tokenSymbol={primaryCurrencyProperties.suffix}
        secondary={showFiat ? secondaryCurrencyDisplay : undefined}
        tokenImage={balanceIsLoading ? null : primaryTokenImage}
        tokenBalance={balance}
        tokenDecimals={18}
        identiconBorder
      />
      <TokenList
        onTokenClick={(tokenData) =>
          dispatch(showModal({ name: 'ACCOUNT_DETAILS', token: tokenData }))
        }
      />
      {detectedTokens.length > 0 &&
        !istokenDetectionInactiveOnNonMainnetSupportedNetwork && (
          <DetectedTokensLink setShowDetectedTokens={setShowDetectedTokens} />
        )}
      {/* <Box marginTop={detectedTokens.length > 0 ? 0 : 4}>
        <Box justifyContent={JustifyContent.center}>
          <Typography
            color={Color.textAlternative}
            variant={TypographyVariant.H6}
            fontWeight={FONT_WEIGHT.NORMAL}
          >
            {t('missingToken')}
          </Typography>
        </Box>
        <ImportTokenLink />
      </Box> */}
      {showDetectedTokens && (
        <DetectedToken setShowDetectedTokens={setShowDetectedTokens} />
      )}
    </>
  );
};

export default AssetList;
