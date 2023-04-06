import React from 'react';
import browser from 'webextension-polyfill';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SelectedAccount from '../selected-account';
import ConnectedStatusIndicator from '../connected-status-indicator';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../../shared/constants/app';
import { CONNECTED_ACCOUNTS_ROUTE } from '../../../helpers/constants/routes';
import { getOriginOfCurrentTab } from '../../../selectors';

export default function MenuBar() {
  const history = useHistory();
  const origin = useSelector(getOriginOfCurrentTab);

  const showStatus =
    getEnvironmentType() === ENVIRONMENT_TYPE_POPUP &&
    origin &&
    origin !== browser.runtime.id;

  return (
    <div className="menu-bar">
      {showStatus ? (
        <ConnectedStatusIndicator
          onClick={() => history.push(CONNECTED_ACCOUNTS_ROUTE)}
        />
      ) : null}
      <SelectedAccount />
    </div>
  );
}
