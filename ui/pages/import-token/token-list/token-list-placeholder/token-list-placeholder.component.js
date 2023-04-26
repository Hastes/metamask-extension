import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconTokenSearch from '../../../../components/ui/icon/icon-token-search';

export default class TokenListPlaceholder extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    return (
      <div className="token-list-placeholder">
        <IconTokenSearch size={64} color="var(--color-icon-muted)" />
        <div className="token-list-placeholder__text">
          {this.context.t('addAcquiredTokens')}
        </div>
      </div>
    );
  }
}
