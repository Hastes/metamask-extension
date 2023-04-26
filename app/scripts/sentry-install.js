import { Buffer } from 'buffer';
import setupSentry from './lib/setupSentry';

// The root compartment will populate this with hooks
global.stateHooks = {};
global.Buffer = Buffer;

// setup sentry error reporting
global.sentry = setupSentry({
  release: process.env.METAMASK_VERSION,
  getState: () => global.stateHooks?.getSentryState?.() || {},
});
