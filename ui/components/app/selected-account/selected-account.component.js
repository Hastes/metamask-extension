import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Tooltip from '../../ui/tooltip';

class SelectedAccount extends Component {
  state = {
    copied: false,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    selectedIdentity: PropTypes.object.isRequired,
  };

  render() {
    const { t } = this.context;
    const { selectedIdentity } = this.props;

    return (
      <div className="selected-account">
        <Tooltip
          wrapperClassName="selected-account__tooltip-wrapper"
          position="bottom"
          title={
            this.state.copied ? t('copiedExclamation') : t('copyToClipboard')
          }
        >
          <button
            className="selected-account__clickable"
            data-testid="selected-account-click"
          >
            <div className="selected-account__name">
              {selectedIdentity.name}
            </div>
          </button>
        </Tooltip>
      </div>
    );
  }
}

export default SelectedAccount;
