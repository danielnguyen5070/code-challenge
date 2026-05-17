import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createUser,
  TEST_TOKENS,
} from '../../test/test-utils';
import { CurrencyField } from './CurrencyField';

vi.mock('framer-motion', () => import('../../test/mocks/framer-motion'));

vi.mock('@services', () => ({
  resolveTokenIcon: vi.fn().mockResolvedValue(undefined),
}));

type RenderFieldOptions = {
  label?: string;
  amount?: string;
  symbol?: string;
  usdValue?: number | null;
  balance?: number;
  error?: string;
  readOnlyAmount?: boolean;
  disabled?: boolean;
  onAmountChange?: (value: string) => void;
  onSymbolChange?: (symbol: string) => void;
  onMax?: () => void;
};

function renderCurrencyField(options: RenderFieldOptions = {}) {
  const onAmountChange = options.onAmountChange ?? vi.fn();
  const onSymbolChange = options.onSymbolChange ?? vi.fn();
  const onMax = options.onMax;

  const view = render(
    <CurrencyField
      label={options.label ?? 'You pay'}
      amount={options.amount ?? ''}
      onAmountChange={onAmountChange}
      symbol={options.symbol ?? 'ETH'}
      onSymbolChange={onSymbolChange}
      tokens={TEST_TOKENS}
      usdValue={options.usdValue}
      balance={options.balance}
      error={options.error}
      readOnlyAmount={options.readOnlyAmount}
      disabled={options.disabled}
      onMax={onMax}
    />,
  );

  return { ...view, onAmountChange, onSymbolChange, onMax };
}

describe('CurrencyField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('should render label and amount placeholder when mounted', () => {
      renderCurrencyField();

      expect(screen.getByText('You pay')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.0')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ETH' })).toBeInTheDocument();
    });

    it('should show formatted USD value when usdValue is provided', () => {
      renderCurrencyField({ amount: '1', usdValue: 3000 });

      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });

    it('should show an em dash when usdValue is null', () => {
      renderCurrencyField({ usdValue: null });

      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should show balance and MAX when balance and onMax are provided', () => {
      renderCurrencyField({ balance: 1.2345, onMax: vi.fn() });

      expect(screen.getByText('Balance: 1.2345')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'MAX' })).toBeInTheDocument();
    });
  });

  describe('amount input', () => {
    it('should call onAmountChange with sanitized value when user pastes', async () => {
      const user = createUser();
      const { onAmountChange } = renderCurrencyField();

      await user.click(screen.getByPlaceholderText('0.0'));
      await user.paste('1.5abc');

      expect(onAmountChange).toHaveBeenCalledWith('1.5');
    });

    it('should not call onAmountChange when amount is read-only', async () => {
      const user = createUser();
      const { onAmountChange } = renderCurrencyField({ readOnlyAmount: true });

      const input = screen.getByPlaceholderText('0.0');
      expect(input).toHaveAttribute('readonly');

      await user.click(input);
      await user.paste('1');

      expect(onAmountChange).not.toHaveBeenCalled();
    });

    it('should call onMax when MAX is clicked', async () => {
      const user = createUser();
      const onMax = vi.fn();
      renderCurrencyField({ balance: 2, onMax });

      await user.click(screen.getByRole('button', { name: 'MAX' }));

      expect(onMax).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('should show error message and mark input invalid when error is set', () => {
      renderCurrencyField({ error: 'Insufficient balance' });

      expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.0')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });
  });

  describe('token picker', () => {
    it('should call onSymbolChange when user selects another token', async () => {
      const user = createUser();
      const { onSymbolChange } = renderCurrencyField();

      await user.click(screen.getByRole('button', { name: 'ETH' }));
      await user.click(screen.getByRole('option', { name: /USDC/i }));

      expect(onSymbolChange).toHaveBeenCalledWith('USDC');
    });
  });

  describe('disabled state', () => {
    it('should disable amount input and MAX when disabled', () => {
      renderCurrencyField({
        disabled: true,
        balance: 1,
        onMax: vi.fn(),
      });

      expect(screen.getByPlaceholderText('0.0')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'MAX' })).toBeDisabled();
    });
  });
});
