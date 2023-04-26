import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TokenList from '../token-list';
import { showModal } from '../../../store/actions';
import {
  getDetectedTokensInCurrentNetwork,
  getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
} from '../../../selectors';

import DetectedToken from '../detected-token/detected-token';
import DetectedTokensLink from './detetcted-tokens-link/detected-tokens-link';

const AssetList = () => {
  const [showDetectedTokens, setShowDetectedTokens] = useState(false);

  const detectedTokens = useSelector(getDetectedTokensInCurrentNetwork) || [];
  const istokenDetectionInactiveOnNonMainnetSupportedNetwork = useSelector(
    getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
  );
  const dispatch = useDispatch(false);

  return (
    <>
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
