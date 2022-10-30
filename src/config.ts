export enum Network {
  LOCAL = 0,
  MAINNET = 1,
  GOERLI = 5,
}

export type Config = {
  networkId: Network;
  escrowFactoryAddress: string;
};

export const maxDecimals = {
  ETH: 2,
};

const mainnet = {
  networkId: Network.MAINNET,
  escrowFactoryAddress: '0x6FD4EB990eD2E7bb2b1203E7f728e29904A4d5A4',
};

const goerli = {
  networkId: Network.GOERLI,
  escrowFactoryAddress: '0x356b0EE59feB848F0b7Eb29480835fD5c6D0C79a',
};

const local = {
  networkId: Network.LOCAL,
  escrowFactoryAddress: '0x6FD4EB990eD2E7bb2b1203E7f728e29904A4d5A4',
};

const chains: { [networkId in Network]: Config } = {
  [Network.LOCAL]: local,
  [Network.MAINNET]: mainnet,
  [Network.GOERLI]: goerli,
};

export const getConfig = (network: Network) => {
  return chains[network];
};