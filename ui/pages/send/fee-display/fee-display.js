import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { PRIMARY } from '../../../helpers/constants/common';
import { INSUFFICIENT_TOKENS_ERROR } from '../send.constants';
import UserPreferencedCurrencyDisplay from '../../../components/app/user-preferenced-currency-display';
import Typography from '../../../components/ui/typography';
import Button from '../../../components/ui/button';
import Box from '../../../components/ui/box';
import {
  TypographyVariant,
  DISPLAY,
  FLEX_DIRECTION,
  BLOCK_SIZES,
  Color,
  FONT_STYLE,
  FONT_WEIGHT,
} from '../../../helpers/constants/design-system';
import LoadingHeartBeat from '../../../components/ui/loading-heartbeat';
import { getCurrentDraftTransaction } from '../../../ducks/send';
import { transactionFeeSelector } from '../../../selectors';
import CurrencyAssetDisplay from '../../../components/ui/currency-asset-display';

// import { ChainProvider } from '../../../../app/scripts/controllers/network/chain-provider';

export default function FeeDisplay() {
  const draftTransaction = useSelector(getCurrentDraftTransaction);
  const { unapprovedTxs } = useSelector((state) => state.metamask);
  const isInsufficientTokenError =
    draftTransaction?.amount.error === INSUFFICIENT_TOKENS_ERROR;
  const editingTransaction = unapprovedTxs[draftTransaction.id];
  const { details } = draftTransaction.asset;
  const { provider } = details;

  const { hexTransactionTotal } = useSelector((state) =>
    transactionFeeSelector(state, editingTransaction),
  );

  // if (draftTransaction?.asset.type === 'NATIVE') {
  //   detailTotal = (
  //     <Box
  //       height={BLOCK_SIZES.MAX}
  //       display={DISPLAY.FLEX}
  //       flexDirection={FLEX_DIRECTION.COLUMN}
  //     >
  //       <LoadingHeartBeat estimateUsed={transactionData?.userFeeLevel} />
  //       <UserPreferencedCurrencyDisplay
  //         type={PRIMARY}
  //         key="total-detail-value"
  //         value={hexTransactionTotal}
  //         hideLabel={!useNativeCurrencyAsPrimaryCurrency}
  //       />
  //     </Box>
  //   );
  //   maxAmount = (
  //     <UserPreferencedCurrencyDisplay
  //       type={PRIMARY}
  //       key="total-max-amount"
  //       value={addHexes(
  //         draftTransaction.amount.value,
  //         hexMaximumTransactionFee,
  //       )}
  //     />
  //   );
  // }

  return (
    <Box>
      <CurrencyAssetDisplay
        key="total-detail-value"
        value={hexTransactionTotal}
        provider={provider}
      />
    </Box>
  );
}
