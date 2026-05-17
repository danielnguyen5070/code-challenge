import { getMockBalance } from '@lib/tokens';
import type { Token } from '@types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

export const TEST_TOKENS: Token[] = [
  { symbol: 'ETH', price: 3000 },
  { symbol: 'USDC', price: 1 },
  { symbol: 'BTC', price: 60_000 },
];

export function createPriceMap(tokens: Token[] = TEST_TOKENS): Map<string, number> {
  return new Map(tokens.map((token) => [token.symbol, token.price]));
}

export const ETH_BALANCE = getMockBalance('ETH');

export function getPaySection() {
  return screen.getByText('You pay').parentElement?.parentElement as HTMLElement;
}

export function getReceiveSection() {
  const section = screen.getByText('You receive').parentElement?.parentElement;
  if (!section) {
    throw new Error('Receive section not found');
  }
  return section as HTMLElement;
}

export function getPayInput() {
  return screen.getAllByPlaceholderText('0.0')[0];
}

export function getReceiveInput() {
  return screen.getAllByPlaceholderText('0.0')[1];
}

export function getConfirmButton() {
  return screen.getByRole('button', { name: 'Confirm swap' });
}

export function createUser() {
  return userEvent.setup();
}

export { render, screen, waitFor, within };
export type { ReactElement };
