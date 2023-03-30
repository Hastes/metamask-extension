import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Identicon from '../../ui/identicon';
import MetaFoxLogo from '../../ui/metafox-logo';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';
import WalletDisplay from '../wallet-display';

///: BEGIN:ONLY_INCLUDE_IN(beta)
import BetaHeader from '../beta-header';
///: END:ONLY_INCLUDE_IN(beta)

export default class AppHeader extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    settingsDropdownOpen: PropTypes.bool,
    showSettingsDropdown: PropTypes.func,
    hideSettingsDropdown: PropTypes.func,
    toggleAccountMenu: PropTypes.func,
    selectedAddress: PropTypes.string,
    isUnlocked: PropTypes.bool,
    hideNetworkIndicator: PropTypes.bool,
    disabled: PropTypes.bool,
    disableNetworkIndicator: PropTypes.bool,
    isAccountMenuOpen: PropTypes.bool,
    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    unreadNotificationsCount: PropTypes.number,
    desktopEnabled: PropTypes.bool,
    ///: END:ONLY_INCLUDE_IN
    ///: BEGIN:ONLY_INCLUDE_IN(beta)
    showBetaHeader: PropTypes.bool,
    ///: END:ONLY_INCLUDE_IN
    onClick: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  handleSettingsClick() {
    const {
      settingsDropdownOpen,
      showSettingsDropdown,
      hideSettingsDropdown,
      disabled,
    } = this.props;

    if (disabled) {
      return;
    }

    if (settingsDropdownOpen === false) {
      this.context.trackEvent({
        category: EVENT.CATEGORIES.NAVIGATION,
        event: EVENT_NAMES.NAV_NETWORK_MENU_OPENED,
        properties: {},
      });
      showSettingsDropdown();
    } else {
      hideSettingsDropdown();
    }
  }

  render() {
    const {
      history,
      disableNetworkIndicator,
      disabled,
      onClick,
      toggleAccountMenu,
      isUnlocked,
      ///: BEGIN:ONLY_INCLUDE_IN(beta)
      showBetaHeader,
      ///: END:ONLY_INCLUDE_IN(beta)
      ///: BEGIN:ONLY_INCLUDE_IN(flask)
      desktopEnabled,
      ///: END:ONLY_INCLUDE_IN
    } = this.props;

    return (
      <>
        {
          ///: BEGIN:ONLY_INCLUDE_IN(beta)
          showBetaHeader ? <BetaHeader /> : null
          ///: END:ONLY_INCLUDE_IN(beta)
        }

        <div className="app-header">
          <div className="app-header__contents">
            <MetaFoxLogo
              unsetIconHeight
              src="./images/logo/desktop.svg"
              onClick={async () => {
                if (onClick) {
                  await onClick();
                }
                history.push(DEFAULT_ROUTE);
              }}
            />
            {
              ///: BEGIN:ONLY_INCLUDE_IN(flask)
              desktopEnabled && process.env.METAMASK_DEBUG && (
                <div data-testid="app-header-desktop-dev-logo">
                  <MetaFoxLogo
                    unsetIconHeight
                    src="./images/logo/desktop.svg"
                  />
                </div>
              )
              ///: END:ONLY_INCLUDE_IN
            }
            <div className="app-header__account-menu-container">
              {isUnlocked && (
                <>
                  <div className="app-header__network-component-wrapper">
                    <WalletDisplay
                      onClick={() => toggleAccountMenu()}
                      disabled={disabled || disableNetworkIndicator}
                    />
                  </div>
                  <button
                    data-testid="account-menu-icon"
                    className={classnames('account-menu__icon', {
                      'account-menu__icon--disabled': disabled,
                    })}
                    onClick={() => {
                      if (!disabled) {
                        this.handleSettingsClick();
                      }
                    }}
                  >
                    <svg
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.571 12.2321L19.55 12.2151L18.141 11.1102C18.0518 11.0397 17.9806 10.9489 17.9333 10.8455C17.8859 10.742 17.8638 10.6288 17.8687 10.5152V9.99908C17.8643 9.88614 17.8866 9.77376 17.9341 9.67116C17.9815 9.56856 18.0526 9.47868 18.1415 9.4089L19.55 8.30355L19.571 8.28658C19.7882 8.10563 19.9339 7.85331 19.9822 7.57474C20.0305 7.29618 19.978 7.00953 19.8343 6.76605L17.9277 3.46696C17.9255 3.46384 17.9235 3.46056 17.9219 3.45713C17.7774 3.21703 17.5534 3.0351 17.2887 2.94295C17.0241 2.8508 16.7356 2.85424 16.4732 2.95267L16.4576 2.95847L14.8013 3.62499C14.6968 3.66726 14.5837 3.68408 14.4714 3.67406C14.3591 3.66405 14.2508 3.62749 14.1553 3.5674C14.0089 3.47514 13.8601 3.38794 13.7089 3.30579C13.6109 3.25264 13.5267 3.17719 13.4632 3.08553C13.3997 2.99387 13.3586 2.88857 13.3433 2.77812L13.0937 1.01071L13.0884 0.978569C13.0341 0.704818 12.8872 0.458111 12.6724 0.279907C12.4576 0.101703 12.188 0.00286387 11.9089 0H8.09107C7.80806 0.00090559 7.53446 0.101659 7.31845 0.28451C7.10244 0.467361 6.95789 0.720578 6.91027 0.999551L6.90625 1.02455L6.65759 2.79553C6.64234 2.90566 6.60159 3.01072 6.53858 3.10232C6.47557 3.19393 6.39204 3.26957 6.29465 3.32321C6.14302 3.40487 5.99413 3.49153 5.84822 3.58303C5.75298 3.64275 5.64493 3.67903 5.53295 3.68889C5.42096 3.69874 5.30823 3.68189 5.20403 3.63972L3.54644 2.97008L3.53082 2.96383C3.26808 2.86529 2.9791 2.86198 2.71418 2.95448C2.44925 3.04697 2.22513 3.22942 2.08082 3.47008L2.07502 3.4799L0.165646 6.78123C0.0217314 7.02495 -0.0307951 7.31192 0.0174596 7.59082C0.0657143 7.86971 0.211603 8.12235 0.429038 8.30355L0.450021 8.32051L1.85895 9.42542C1.94817 9.49601 2.01937 9.58675 2.06671 9.6902C2.11405 9.79365 2.13618 9.90685 2.13127 10.0205V10.5366C2.13574 10.6495 2.11334 10.7619 2.06592 10.8645C2.01851 10.9671 1.94742 11.057 1.8585 11.1268L0.450021 12.2321L0.429038 12.2491C0.211819 12.43 0.0660481 12.6823 0.0177936 12.9609C-0.030461 13.2395 0.0219471 13.5261 0.165646 13.7696L2.07234 17.0687C2.07453 17.0718 2.07647 17.0751 2.07814 17.0785C2.22262 17.3186 2.44662 17.5006 2.71125 17.5927C2.97589 17.6849 3.26444 17.6814 3.5268 17.583L3.54242 17.5772L5.19733 16.9107C5.30187 16.8684 5.41495 16.8516 5.52726 16.8616C5.63957 16.8716 5.7479 16.9082 5.84331 16.9683C5.98974 17.0608 6.13855 17.148 6.28974 17.2299C6.38776 17.283 6.47192 17.3585 6.53543 17.4501C6.59894 17.5418 6.64002 17.6471 6.65536 17.7575L6.90357 19.5249L6.90893 19.5571C6.96335 19.8313 7.11065 20.0783 7.32599 20.2566C7.54132 20.4348 7.81154 20.5334 8.09107 20.5357H11.9089C12.1919 20.5348 12.4655 20.434 12.6815 20.2512C12.8975 20.0683 13.0421 19.8151 13.0897 19.5361L13.0937 19.5111L13.3424 17.7401C13.3579 17.6298 13.399 17.5246 13.4624 17.433C13.5258 17.3414 13.6098 17.2658 13.7076 17.2125C13.8603 17.1303 14.0094 17.0433 14.154 16.9526C14.2492 16.8929 14.3573 16.8566 14.4693 16.8468C14.5813 16.8369 14.694 16.8538 14.7982 16.8959L16.4558 17.5633L16.4714 17.5696C16.7341 17.6683 17.0232 17.6717 17.2881 17.5792C17.5531 17.4867 17.7772 17.3041 17.9214 17.0633C17.9232 17.06 17.9251 17.0567 17.9272 17.0535L19.8339 13.7549C19.9781 13.5112 20.0308 13.2241 19.9826 12.9451C19.9344 12.6661 19.7885 12.4133 19.571 12.2321ZM13.5674 10.4357C13.5349 11.127 13.3022 11.794 12.8977 12.3555C12.4931 12.9171 11.9341 13.349 11.2886 13.5987C10.6432 13.8485 9.93907 13.9053 9.26191 13.7623C8.58476 13.6192 7.96375 13.2826 7.47439 12.7931C6.98504 12.3037 6.64843 11.6827 6.5055 11.0055C6.36256 10.3283 6.41946 9.62423 6.66928 8.9788C6.91909 8.33337 7.35106 7.77442 7.91265 7.36994C8.47424 6.96545 9.14125 6.73286 9.83259 6.70043C10.3289 6.67858 10.8243 6.76024 11.2874 6.94023C11.7504 7.12022 12.171 7.39459 12.5222 7.7459C12.8735 8.09722 13.1478 8.51778 13.3278 8.98085C13.5077 9.44392 13.5893 9.93937 13.5674 10.4357Z"
                        fill="#3354A5"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
