import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { PRIMARY } from '../../../helpers/constants/common';
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
import { addHexes } from '../../../../shared/modules/conversion.utils';

import ChainTron from '../../../../app/scripts/controllers/network/chain-provider/chain-tron';

export default function FeeDisplayTron() {
  const draftTransaction = useSelector(getCurrentDraftTransaction);

  let detailTotal, maxAmount;

  const [fee, setFee] = useState([]);

  const hexMaximumTransactionFee = '0x0';

  const chainTron = new ChainTron();

  chainTron.getFee().then((resp) => {
    // setFee(resp);
  });

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

  return <Box>{fee}</Box>;
}
