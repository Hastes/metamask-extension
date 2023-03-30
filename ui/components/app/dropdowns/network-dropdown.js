import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import * as actions from '../../../store/actions';

import { SETTINGS_ROUTE } from '../../../helpers/constants/routes';
import {
  IconColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { Icon, ICON_NAMES, Text } from '../../component-library';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';

import { Dropdown } from './dropdown';
import { DropdownItem } from './dropdown-item';

// classes from nodes of the toggle element.
const notToggleElementClassnames = [
  'menu-icon',
  'modal-container__footer-button',
];

function mapStateToProps(state) {
  return {
    settingsDropdownOpen: state.appState.settingsDropdownOpen,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    hideSettingsDropdown: () => dispatch(actions.hideSettingsDropdown()),
  };
}

class NetworkDropdown extends Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    hideSettingsDropdown: PropTypes.func.isRequired,
    settingsDropdownOpen: PropTypes.bool.isRequired,
    history: PropTypes.object,
  };

  render() {
    const { hideSettingsDropdown, history } = this.props;

    const isOpen = this.props.settingsDropdownOpen;

    const { t, trackEvent } = this.context;

    return (
      <Dropdown
        isOpen={isOpen}
        onClickOutside={(event) => {
          const { classList } = event.target;
          const isInClassList = (className) => classList.contains(className);
          const notToggleElementIndex =
            notToggleElementClassnames.findIndex(isInClassList);

          if (notToggleElementIndex === -1) {
            event.stopPropagation();
            hideSettingsDropdown();
          }
        }}
        containerClassName="settings-droppo"
        zIndex={55}
        style={{
          position: 'absolute',
          top: '58px',
          width: '309px',
          zIndex: '55',
        }}
        innerStyle={{
          padding: '16px 0 0',
        }}
      >
        <div className="settings-dropdown-list">
          <Text
            variant={TextVariant.bodyLgMedium}
            marginLeft={4}
            marginBottom={2}
          >
            {t('settings')}
          </Text>
          <div className="divider"></div>
          <DropdownItem
            onClick={() => {
              trackEvent({
                event: EVENT_NAMES.APP_WINDOW_EXPANDED,
                category: EVENT.CATEGORIES.NAVIGATION,
                properties: {
                  location: 'Account Options',
                },
              });
              global.platform.openExtensionInBrowser();
            }}
            icon={
              <Icon
                name={ICON_NAMES.EXPAND}
                color={IconColor.iconAlternative}
                ariaLabel={t('expandView')}
              />
            }
            text={t('expandView')}
          />
          <div className="divider"></div>
          <DropdownItem
            onClick={() => {
              hideSettingsDropdown();
              history.push(SETTINGS_ROUTE);
              this.context.trackEvent({
                category: EVENT.CATEGORIES.NAVIGATION,
                event: EVENT_NAMES.NAV_SETTINGS_OPENED,
                properties: {
                  location: 'Main Menu',
                },
              });
            }}
            icon={
              <Icon
                name={ICON_NAMES.SETTING}
                color={IconColor.iconAlternative}
                ariaLabel={t('settings')}
              />
            }
            text={t('settings')}
          />
        </div>
      </Dropdown>
    );
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(NetworkDropdown);
