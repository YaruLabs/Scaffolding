import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  Chain,
  mainnet,
  polygon,
  sepolia,
} from 'wagmi/chains';

const coti = {
  id: 2632500,
  name: 'Coti',
  nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.coti.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://mainnet.cotiscan.io' },
  }
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    coti,
    mainnet,
    polygon,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
