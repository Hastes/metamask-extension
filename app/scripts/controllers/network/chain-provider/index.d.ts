import { HDKey } from 'ethereum-cryptography/hdkey';
import {
  NETWORK_TYPES,
  CHAIN_IDS,
} from '../../../../../shared/constants/network';

export type NetworkType = typeof NETWORK_TYPES[keyof typeof NETWORK_TYPES];
export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];

export declare type ProviderConfig = {
  chainId: ChainId;
  type: NetworkType;
  contract?: string;
  decimals?: number;
  symbol?: string;
  iconUrl?: string;
};

export declare type ChainAccount = {
  address: string;
  hdKey: HDKey;
  privateKey?: string;
};

export declare type Fee = {
  minValue?: number | string;
  maxValue?: number | string;

  // Tron resources
  bandwidth?: number | string;
  energy?: number | string;

  // Bitcoin resources
  highFeePerByte?: number | string;
  mediumFeePerByte?: number | string;
  lowFeePerByte?: number | string;
};
