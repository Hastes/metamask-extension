import Eth from 'ethjs-query';
import EthContract from 'ethjs-contract';
import { PollingBlockTracker } from 'eth-block-tracker';
import abi from 'human-standard-token-abi';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import deepEqual from 'deep-equal';
import { getProvider } from '../../scripts/controllers/network/provider-api-tests/helpers';

import Token from './token';

class TokenTracker extends SafeEventEmitter {
  constructor(opts = {}) {
    super();

    this.includeFailedTokens = opts.includeFailedTokens || false;
    this.userAddress = opts.userAddress || '0x0';
    this.provider = opts.provider;
    const pollingInterval = opts.pollingInterval || 4000;
    this.blockTracker = new PollingBlockTracker({
      provider: this.provider,
      pollingInterval,
    });

    const tokens = opts.tokens || [];
    this.balanceDecimals = opts.balanceDecimals;

    this.tokens = tokens.map((tokenOpts) => {
      return this.createTokenFrom(tokenOpts, this.balanceDecimals);
    });

    // initialize to empty array to ensure a tracker initialized
    // with zero tokens doesn't emit an update until a token is added.
    this._oldBalances = [];

    Promise.all(this.tokens.map((token) => token.update()))
      .then((newBalances) => {
        this._update(newBalances);
      })
      .catch((error) => {
        this.emit('error', error);
      });

    this.updateBalances = this.updateBalances.bind(this);

    this.running = true;
    this.blockTracker.on('latest', this.updateBalances);
  }

  serialize() {
    return this.tokens.map((token) => token.serialize());
  }

  async updateBalances() {
    try {
      await Promise.all(
        this.tokens.map((token) => {
          return token.updateBalance();
        }),
      );

      const newBalances = this.serialize();
      this._update(newBalances);
    } catch (reason) {
      this.emit('error', reason);
    }
  }

  createTokenFrom(opts, balanceDecimals) {
    const { account, provider, symbol, balance, decimals, image } = opts;

    return new Token({
      provider,
      symbol,
      balance,
      decimals,
      owner: account || this.userAddress,
      throwOnBalanceError: this.includeFailedTokens === false,
      balanceDecimals,
      image,
    });
  }

  add(opts) {
    const token = this.createTokenFrom(opts);
    this.tokens.push(token);
    token
      .update()
      .then(() => {
        this._update(this.serialize());
      })
      .catch((error) => {
        this.emit('error', error);
      });
  }

  stop() {
    this.running = false;
    this.blockTracker.removeListener('latest', this.updateBalances);
  }

  _update(newBalances) {
    if (!this.running || deepEqual(newBalances, this._oldBalances)) {
      return;
    }
    this._oldBalances = newBalances;
    this.emit('update', newBalances);
  }
}

export default TokenTracker;
