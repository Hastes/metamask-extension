import EventEmitter from 'events';
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Button from '../../../components/ui/button';
import Box from '../../../components/ui/box';
import { Text } from '../../../components/component-library';
import {
  FONT_WEIGHT,
  TEXT_ALIGN,
  TextVariant,
  FLEX_DIRECTION,
  BLOCK_SIZES,
  AlignItems,
  JustifyContent,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';
import { setFirstTimeFlowType } from '../../../store/actions';
import {
  ONBOARDING_METAMETRICS,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
} from '../../../helpers/constants/routes';
import { FIRST_TIME_FLOW_TYPES } from '../../../helpers/constants/onboarding';
import { getFirstTimeFlowType, getCurrentKeyring } from '../../../selectors';

export default function OnboardingWelcome() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const [eventEmitter] = useState(new EventEmitter());
  const currentKeyring = useSelector(getCurrentKeyring);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);

  // Don't allow users to come back to this screen after they
  // have already imported or created a wallet
  useEffect(() => {
    if (currentKeyring) {
      if (firstTimeFlowType === FIRST_TIME_FLOW_TYPES.IMPORT) {
        history.replace(ONBOARDING_COMPLETION_ROUTE);
      } else {
        history.replace(ONBOARDING_SECURE_YOUR_WALLET_ROUTE);
      }
    }
  }, [currentKeyring, history, firstTimeFlowType]);
  const trackEvent = useContext(MetaMetricsContext);

  const onCreateClick = () => {
    dispatch(setFirstTimeFlowType('create'));
    trackEvent({
      category: EVENT.CATEGORIES.ONBOARDING,
      event: EVENT_NAMES.ONBOARDING_WALLET_CREATION_STARTED,
      properties: {
        account_type: 'metamask',
      },
    });
    history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
  };

  const onImportClick = () => {
    dispatch(setFirstTimeFlowType('import'));
    trackEvent({
      category: EVENT.CATEGORIES.ONBOARDING,
      event: EVENT_NAMES.ONBOARDING_WALLET_IMPORT_STARTED,
      properties: {
        account_type: 'imported',
      },
    });
    history.push(ONBOARDING_IMPORT_WITH_SRP_ROUTE);
  };

  trackEvent({
    category: EVENT.CATEGORIES.ONBOARDING,
    event: EVENT_NAMES.ONBOARDING_WELCOME,
    properties: {
      message_title: t('welcomeToMetaMask'),
      app_version: global?.platform?.getVersion(),
    },
  });

  return (
    <div className="onboarding-welcome" data-testid="onboarding-welcome">
      <div>
        <Text
          variant={TextVariant.headingMd}
          as="h2"
          textAlign={TEXT_ALIGN.CENTER}
          fontWeight={FONT_WEIGHT.NORMAL}
          marginBottom={4}
        >
          {t('welcomeToMetaMask')}
        </Text>
        <Text textAlign={TEXT_ALIGN.CENTER} marginLeft={6} marginRight={6}>
          {t('welcomeToMetaMaskIntro')}
        </Text>
        <div className="onboarding-welcome__cards">
          <div className="welcome-card">
            <Box
              flexDirection={FLEX_DIRECTION.COLUMN}
              height={BLOCK_SIZES.FULL}
              alignItems={AlignItems.center}
              justifyContent={JustifyContent.center}
            >
              <div>
                <svg
                  width="39"
                  height="40"
                  viewBox="0 0 39 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M27.9 30.75V35.45C27.9 35.6833 27.9833 35.875 28.15 36.025C28.3167 36.175 28.5167 36.25 28.75 36.25C28.9833 36.25 29.175 36.1667 29.325 36C29.475 35.8333 29.55 35.6333 29.55 35.4V30.75H34.25C34.4833 30.75 34.675 30.6667 34.825 30.5C34.975 30.3333 35.05 30.1333 35.05 29.9C35.05 29.6667 34.975 29.475 34.825 29.325C34.675 29.175 34.4833 29.1 34.25 29.1H29.55V24.4C29.55 24.1667 29.475 23.975 29.325 23.825C29.175 23.675 28.9833 23.6 28.75 23.6C28.5167 23.6 28.3167 23.675 28.15 23.825C27.9833 23.975 27.9 24.1667 27.9 24.4V29.1H23.2C22.9667 29.1 22.775 29.175 22.625 29.325C22.475 29.475 22.4 29.6667 22.4 29.9C22.4 30.1333 22.4833 30.3333 22.65 30.5C22.8167 30.6667 23.0167 30.75 23.25 30.75H27.9ZM28.65 39.25C26.05 39.25 23.8333 38.325 22 36.475C20.1667 34.625 19.25 32.4333 19.25 29.9C19.25 27.3 20.1667 25.075 22 23.225C23.8333 21.375 26.05 20.45 28.65 20.45C31.2167 20.45 33.425 21.375 35.275 23.225C37.125 25.075 38.05 27.3 38.05 29.9C38.05 32.4333 37.125 34.625 35.275 36.475C33.425 38.325 31.2167 39.25 28.65 39.25ZM3 35.25C2.16667 35.25 1.45833 34.9583 0.875 34.375C0.291667 33.7917 0 33.0833 0 32.25V12.75C0 12.2833 0.108333 11.8333 0.325 11.4C0.541667 10.9667 0.833333 10.6167 1.2 10.35L14.2 0.6C14.7333 0.2 15.3333 0 16 0C16.6667 0 17.2667 0.2 17.8 0.6L30.8 10.35C31.1667 10.6167 31.4583 10.9667 31.675 11.4C31.8917 11.8333 32 12.2833 32 12.75V17.95C31.5333 17.7833 31.05 17.6667 30.55 17.6C30.05 17.5333 29.5333 17.4833 29 17.45V12.75L16 3L3 12.75V32.25H16.5C16.6 32.7833 16.7333 33.3 16.9 33.8C17.0667 34.3 17.2667 34.7833 17.5 35.25H3Z"
                    fill="#3662CF"
                  />
                </svg>
              </div>
              <Text
                textAlign={TEXT_ALIGN.CENTER}
                marginBottom={6}
                marginTop={6}
              >
                {t('welcomeToMetaMaskIntro')}
              </Text>
              <Button
                data-testid="onboarding-create-wallet"
                type="primary"
                onClick={onCreateClick}
              >
                {t('onboardingCreateWallet')}
              </Button>
            </Box>
          </div>
          <div className="welcome-card">
            <Box
              flexDirection={FLEX_DIRECTION.COLUMN}
              height={BLOCK_SIZES.FULL}
              alignItems={AlignItems.center}
              justifyContent={JustifyContent.center}
            >
              <div>
                <svg
                  width="44"
                  height="32"
                  viewBox="0 0 44 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.55 31.6C7.61667 31.6 5.125 30.575 3.075 28.525C1.025 26.475 0 23.9833 0 21.05C0 18.4167 0.841667 16.125 2.525 14.175C4.20833 12.225 6.31667 11.05 8.85 10.65C9.35 7.85 10.7167 5.375 12.95 3.225C15.1833 1.075 17.7167 0 20.55 0C21.35 0 22.05 0.225 22.65 0.675C23.25 1.125 23.55 1.73333 23.55 2.5V17.2L26.65 14.1C26.95 13.8 27.3083 13.65 27.725 13.65C28.1417 13.65 28.5 13.8 28.8 14.1C29.1 14.4 29.25 14.7583 29.25 15.175C29.25 15.5917 29.1 15.95 28.8 16.25L23.1 21.95C22.9333 22.1167 22.7667 22.2333 22.6 22.3C22.4333 22.3667 22.25 22.4 22.05 22.4C21.85 22.4 21.6667 22.3667 21.5 22.3C21.3333 22.2333 21.1667 22.1167 21 21.95L15.3 16.25C15 15.95 14.8583 15.5917 14.875 15.175C14.8917 14.7583 15.05 14.4 15.35 14.1C15.65 13.8 16.0083 13.65 16.425 13.65C16.8417 13.65 17.2 13.8 17.5 14.1L20.55 17.2V2.75C17.6833 3.11667 15.4333 4.375 13.8 6.525C12.1667 8.675 11.35 11 11.35 13.5H10.4C8.36667 13.5 6.625 14.2167 5.175 15.65C3.725 17.0833 3 18.8833 3 21.05C3 23.2167 3.75 25.0167 5.25 26.45C6.75 27.8833 8.51667 28.6 10.55 28.6H35.55C37.05 28.6 38.3333 28.0667 39.4 27C40.4667 25.9333 41 24.65 41 23.15C41 21.65 40.4667 20.3667 39.4 19.3C38.3333 18.2333 37.05 17.7 35.55 17.7H32.4V13.5C32.4 11.2333 31.85 9.275 30.75 7.625C29.65 5.975 28.2333 4.66667 26.5 3.7V0.450001C29.2 1.41667 31.3583 3.1 32.975 5.5C34.5917 7.9 35.4 10.5667 35.4 13.5V14.7C37.8 14.6333 39.8333 15.4 41.5 17C43.1667 18.6 44 20.65 44 23.15C44 25.45 43.1667 27.4333 41.5 29.1C39.8333 30.7667 37.85 31.6 35.55 31.6H10.55Z"
                    fill="#3662CF"
                  />
                </svg>
              </div>
              <Text
                textAlign={TEXT_ALIGN.CENTER}
                marginBottom={6}
                marginTop={6}
              >
                {t('welcomeToMetaMaskIntro')}
              </Text>
              <Button
                data-testid="onboarding-import-wallet"
                type="secondary"
                onClick={onImportClick}
              >
                {t('onboardingImportWallet')}
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
