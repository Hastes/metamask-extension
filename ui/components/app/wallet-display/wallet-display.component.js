import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import LoadingIndicator from '../../ui/loading-indicator';
import {
  BorderColor,
  TypographyVariant,
} from '../../../helpers/constants/design-system';
import Chip from '../../ui/chip/chip';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { Icon, ICON_NAMES, ICON_SIZES } from '../../component-library';

export default function WalletDisplay({
  disabled,
  onClick,
  isAccountMenuOpen,
  selectedIdentity,
  unreadNotificationsCount,
}) {
  const t = useI18nContext();
  const { name: nickname } = selectedIdentity;

  return (
    <Chip
      dataTestId="network-display"
      borderColor={
        onClick ? BorderColor.borderDefault : BorderColor.borderMuted
      }
      onClick={onClick}
      leftIcon={
        <LoadingIndicator
          alt={t('attemptingConnect')}
          title={t('attemptingConnect')}
          isLoading={false}
        />
      }
      rightIcon={
        onClick ? (
          <Icon
            name={
              isAccountMenuOpen ? ICON_NAMES.ARROW_UP : ICON_NAMES.ARROW_DOWN
            }
            size={ICON_SIZES.XS}
          />
        ) : null
      }
      label={nickname}
      className={classnames('network-display', {
        'network-display--disabled': disabled,
        'network-display--clickable': typeof onClick === 'function',
      })}
      labelProps={{
        variant: TypographyVariant.H7,
      }}
    />
  );
}

WalletDisplay.propTypes = {
  //  Whether the WalletDisplay is disabled
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  isAccountMenuOpen: PropTypes.bool,
  selectedIdentity: PropTypes.object,
  unreadNotificationsCount: PropTypes.number,
};
