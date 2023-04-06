import React, { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { I18nContext } from '../../../contexts/i18n';
import { useGasFeeContext } from '../../../contexts/gasFee';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import UserPreferencedCurrencyDisplay from '../../../components/app/user-preferenced-currency-display';
import GasTiming from '../../../components/app/gas-timing';
import InfoTooltip from '../../../components/ui/info-tooltip';
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
import { TokenStandard } from '../../../../shared/constants/transaction';
import LoadingHeartBeat from '../../../components/ui/loading-heartbeat';
import TransactionDetailItem from '../../../components/app/transaction-detail-item';
import { NETWORK_TO_NAME_MAP } from '../../../../shared/constants/network';
import TransactionDetail from '../../../components/app/transaction-detail';
import ActionableMessage from '../../../components/ui/actionable-message';
import CurrencyAssetDisplay from '../../../components/ui/currency-asset-display';

import {
  getPreferences,
  getIsBuyableChain,
  transactionFeeSelector,
  getUseCurrencyRateCheck,
} from '../../../selectors';

import { INSUFFICIENT_TOKENS_ERROR } from '../send.constants';
import { getCurrentDraftTransaction } from '../../../ducks/send';
import { showModal } from '../../../store/actions';
import {
  addHexes,
  hexWEIToDecETH,
  hexWEIToDecGWEI,
} from '../../../../shared/modules/conversion.utils';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import useRamps from '../../../hooks/experiences/useRamps';

export default function GasDisplay({ gasError }) {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const { estimateUsed } = useGasFeeContext();
  const trackEvent = useContext(MetaMetricsContext);

  const { openBuyCryptoInPdapp } = useRamps();

  // const isMainnet = useSelector(getIsMainnet);
  // const isTestnet = useSelector(getIsTestnet);
  const isBuyableChain = useSelector(getIsBuyableChain);
  const draftTransaction = useSelector(getCurrentDraftTransaction);
  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);
  const { showFiatInTestnets, useNativeCurrencyAsPrimaryCurrency } =
    useSelector(getPreferences);
  const { unapprovedTxs } = useSelector((state) => state.metamask);

  const isInsufficientTokenError =
    draftTransaction?.amount.error === INSUFFICIENT_TOKENS_ERROR;

  const editingTransaction = unapprovedTxs[draftTransaction.id];

  const transactionData = {
    txParams: {
      gasPrice: draftTransaction.gas?.gasPrice,
      gas: editingTransaction?.userEditedGasLimit
        ? editingTransaction?.txParams?.gas
        : draftTransaction.gas?.gasLimit,
      maxFeePerGas: editingTransaction?.txParams?.maxFeePerGas
        ? editingTransaction?.txParams?.maxFeePerGas
        : draftTransaction.gas?.maxFeePerGas,
      maxPriorityFeePerGas: editingTransaction?.txParams?.maxPriorityFeePerGas
        ? editingTransaction?.txParams?.maxPriorityFeePerGas
        : draftTransaction.gas?.maxPriorityFeePerGas,
      value: draftTransaction.amount?.value,
      type: draftTransaction.transactionType,
    },
    userFeeLevel: editingTransaction?.userFeeLevel,
  };
  const { details } = draftTransaction.asset;
  // const chainId = details.chain.id;
  const { provider } = details;
  const currentNetworkName = NETWORK_TO_NAME_MAP[provider.chainId];
  const nativeCurrency = details.symbol;
  const isMainnet = details.provider.chainId === '0x1';
  const isTestnet = false;

  const {
    hexMinimumTransactionFee,
    hexMaximumTransactionFee,
    hexTransactionTotal,
  } = useSelector((state) => transactionFeeSelector(state, transactionData));

  let title;
  if (
    draftTransaction?.asset.details?.standard === TokenStandard.ERC721 ||
    draftTransaction?.asset.details?.standard === TokenStandard.ERC1155
  ) {
    title = draftTransaction?.asset.details?.name;
  } else {
    title = `${hexWEIToDecETH(draftTransaction.amount.value)} ${
      draftTransaction?.asset.details?.symbol
    }`;
  }

  const ethTransactionTotalMaxAmount = Number(
    hexWEIToDecETH(hexMaximumTransactionFee),
  );

  const primaryTotalTextOverrideMaxAmount = `${title} + ${ethTransactionTotalMaxAmount} ${nativeCurrency}`;

  const showCurrencyRateCheck = useCurrencyRateCheck && isMainnet;

  let detailTotal, maxAmount;

  if (draftTransaction?.asset.type === 'NATIVE') {
    detailTotal = (
      <Box
        height={BLOCK_SIZES.MAX}
        display={DISPLAY.FLEX}
        flexDirection={FLEX_DIRECTION.COLUMN}
        className="gas-display__total-value"
      >
        <LoadingHeartBeat estimateUsed={transactionData?.userFeeLevel} />
        <CurrencyAssetDisplay
          key="total-detail-value"
          value={hexTransactionTotal}
          provider={provider}
        />
      </Box>
    );
    maxAmount = (
      <CurrencyAssetDisplay
        key="total-max-amount"
        value={addHexes(
          draftTransaction.amount.value,
          hexMaximumTransactionFee,
        )}
        provider={provider}
      />
    );
  } else if (useNativeCurrencyAsPrimaryCurrency) {
    detailTotal = primaryTotalTextOverrideMaxAmount;
    maxAmount = primaryTotalTextOverrideMaxAmount;
  }

  return (
    <>
      <Box className="gas-display">
        <TransactionDetail
          userAcknowledgedGasMissing={false}
          rows={[
            <TransactionDetailItem
              key="gas-item"
              detailTitle={
                <Box display={DISPLAY.FLEX}>
                  <Box marginRight={1}>{t('gas')}</Box>
                  <Typography
                    as="span"
                    marginTop={0}
                    color={Color.textMuted}
                    fontStyle={FONT_STYLE.ITALIC}
                    fontWeight={FONT_WEIGHT.NORMAL}
                    className="gas-display__title__estimate"
                  >
                    ({t('transactionDetailGasInfoV2')})
                  </Typography>
                  <InfoTooltip
                    contentText={
                      <>
                        <Typography variant={TypographyVariant.H7}>
                          {t('transactionDetailGasTooltipIntro', [
                            isMainnet ? t('networkNameEthereum') : '',
                          ])}
                        </Typography>
                        <Typography variant={TypographyVariant.H7}>
                          {t('transactionDetailGasTooltipExplanation')}
                        </Typography>
                        <Typography variant={TypographyVariant.H7}>
                          <a
                            href="https://community.metamask.io/t/what-is-gas-why-do-transactions-take-so-long/3172"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('transactionDetailGasTooltipConversion')}
                          </a>
                        </Typography>
                      </>
                    }
                    position="right"
                  />
                </Box>
              }
              detailTitleColor={Color.textDefault}
              detailText={
                showCurrencyRateCheck && (
                  <Box className="gas-display__currency-container">
                    <LoadingHeartBeat estimateUsed={estimateUsed} />
                    <UserPreferencedCurrencyDisplay
                      type={SECONDARY}
                      value={hexMinimumTransactionFee}
                      hideLabel={Boolean(useNativeCurrencyAsPrimaryCurrency)}
                    />
                  </Box>
                )
              }
              detailTotal={
                <Box className="gas-display__currency-container">
                  <LoadingHeartBeat estimateUsed={estimateUsed} />
                  <CurrencyAssetDisplay
                    value={hexMinimumTransactionFee}
                    provider={provider}
                  />
                </Box>
              }
              subText={
                <>
                  <Box
                    key="editGasSubTextFeeLabel"
                    display={DISPLAY.INLINE_FLEX}
                    className={classNames('gas-display__gas-fee-label', {
                      'gas-display__gas-fee-warning': estimateUsed === 'high',
                    })}
                  >
                    <LoadingHeartBeat estimateUsed={estimateUsed} />
                    <Box marginRight={1}>
                      <strong>
                        {estimateUsed === 'high' && '⚠ '}
                        {t('editGasSubTextFeeLabel')}
                      </strong>
                    </Box>
                    <Box
                      key="editGasSubTextFeeValue"
                      className="gas-display__currency-container"
                    >
                      <LoadingHeartBeat estimateUsed={estimateUsed} />
                      <CurrencyAssetDisplay
                        key="editGasSubTextFeeAmount"
                        value={hexMaximumTransactionFee}
                        provider={provider}
                      />
                    </Box>
                  </Box>
                </>
              }
              subTitle={
                <GasTiming
                  maxPriorityFeePerGas={hexWEIToDecGWEI(
                    draftTransaction.gas.maxPriorityFeePerGas,
                  )}
                  maxFeePerGas={hexWEIToDecGWEI(
                    draftTransaction.gas.maxFeePerGas,
                  )}
                />
              }
            />,
            (gasError || isInsufficientTokenError) && (
              <TransactionDetailItem
                key="total-item"
                detailTitle={t('total')}
                detailText={
                  showCurrencyRateCheck && (
                    <Box
                      height={BLOCK_SIZES.MAX}
                      display={DISPLAY.FLEX}
                      flexDirection={FLEX_DIRECTION.COLUMN}
                      className="gas-display__total-value"
                    >
                      <LoadingHeartBeat
                        estimateUsed={transactionData?.userFeeLevel}
                      />
                      <UserPreferencedCurrencyDisplay
                        type={SECONDARY}
                        key="total-detail-text"
                        value={hexTransactionTotal}
                        hideLabel={Boolean(useNativeCurrencyAsPrimaryCurrency)}
                      />
                    </Box>
                  )
                }
                detailTotal={detailTotal}
                subTitle={t('transactionDetailGasTotalSubtitle')}
                subText={
                  <Box
                    height={BLOCK_SIZES.MAX}
                    display={DISPLAY.FLEX}
                    flexDirection={FLEX_DIRECTION.COLUMN}
                    className="gas-display__total-amount"
                  >
                    <LoadingHeartBeat
                      estimateUsed={
                        transactionData?.userFeeLevel ?? estimateUsed
                      }
                    />
                    <strong key="editGasSubTextAmountLabel">
                      {t('editGasSubTextAmountLabel')}
                    </strong>{' '}
                    {maxAmount}
                  </Box>
                }
              />
            ),
          ]}
        />
      </Box>
      {(gasError || isInsufficientTokenError) && currentNetworkName && (
        <Box
          className="gas-display__warning-message"
          data-testid="gas-warning-message"
        >
          <Box
            paddingTop={0}
            paddingRight={4}
            paddingBottom={4}
            paddingLeft={4}
            className="gas-display__confirm-approve-content__warning"
          >
            <ActionableMessage
              message={
                isBuyableChain && draftTransaction.asset.type === 'NATIVE' ? (
                  <Typography variant={TypographyVariant.H7} align="left">
                    {t('insufficientCurrencyBuyOrReceive', [
                      nativeCurrency,
                      currentNetworkName,
                      <Button
                        type="inline"
                        className="confirm-page-container-content__link"
                        onClick={() => {
                          openBuyCryptoInPdapp();
                          trackEvent({
                            event: EVENT_NAMES.NAV_BUY_BUTTON_CLICKED,
                            category: EVENT.CATEGORIES.NAVIGATION,
                            properties: {
                              location: 'Gas Warning Insufficient Funds',
                              text: 'Buy',
                            },
                          });
                        }}
                        key={`${nativeCurrency}-buy-button`}
                      >
                        {t('buyAsset', [nativeCurrency])}
                      </Button>,
                      <Button
                        type="inline"
                        className="gas-display__link"
                        onClick={() =>
                          dispatch(showModal({ name: 'ACCOUNT_DETAILS' }))
                        }
                        key="receive-button"
                      >
                        {t('deposit')}
                      </Button>,
                    ])}
                  </Typography>
                ) : (
                  <Typography variant={TypographyVariant.H7} align="left">
                    {t('insufficientCurrencyBuyOrReceive', [
                      nativeCurrency,
                      currentNetworkName,
                      `${t('buyAsset', [nativeCurrency])}`,
                      <Button
                        type="inline"
                        className="gas-display__link"
                        onClick={() =>
                          dispatch(showModal({ name: 'ACCOUNT_DETAILS' }))
                        }
                        key="receive-button"
                      >
                        {t('deposit')}
                      </Button>,
                    ])}
                  </Typography>
                )
              }
              useIcon
              iconFillColor="var(--color-error-default)"
              type="danger"
            />
          </Box>
        </Box>
      )}
    </>
  );
}
GasDisplay.propTypes = {
  gasError: PropTypes.string,
};
