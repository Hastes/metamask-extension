import {
  NETWORK_TYPES,
  CHAIN_IDS,
} from '../../../../../shared/constants/network';

export type NetworkType = typeof NETWORK_TYPES[keyof typeof NETWORK_TYPES];
export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];

export declare type ProviderConfig = {
  chainId: string;
  type: NetworkType;
  rpcUrl?: string;
  contract?: string;
  decimals?: number;
  symbol?: string;
};
