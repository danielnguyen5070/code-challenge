import { executeSwap } from '@services';
import toast from 'react-hot-toast';
import { waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseQuoteLoading = vi.hoisted(() =>
  vi.fn((fromAmount: string) => ({
    isQuoteLoading: false,
    showQuoteSkeleton: false,
    settledAmount: fromAmount,
    debouncedAmount: fromAmount,
  })),
);

vi.mock('@hooks/useQuoteLoading', () => ({
  QUOTE_DEBOUNCE_MS: 450,
  useQuoteLoading: mockUseQuoteLoading,
}));
import {
  createUser,
  ETH_BALANCE,
  getConfirmButton,
  getPayInput,
  getPaySection,
  getReceiveInput,
  screen,
} from '../../test/test-utils';

vi.mock('framer-motion', () => import('../../test/mocks/framer-motion'));

import { SwapCard } from '@components/swap/SwapCard';
import type { Token } from '@types';
import { render } from '@testing-library/react';
import {
  createPriceMap,
  TEST_TOKENS,
} from '../../test/test-utils';

function renderSwapCard(options: {
  tokens?: Token[];
  priceMap?: Map<string, number>;
} = {}) {
  const tokens = options.tokens ?? TEST_TOKENS;
  const priceMap = options.priceMap ?? createPriceMap(tokens);
  return render(<SwapCard tokens={tokens} priceMap={priceMap} />);
}

async function enterPayAmount(
  user: ReturnType<typeof createUser>,
  amount: string,
) {
  await user.click(getPayInput());
  await user.paste(amount);

  await waitFor(() => {
    expect(screen.getByTitle('3,000')).toBeInTheDocument();
  });
}

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services')>();
  return {
    ...actual,
    executeSwap: vi.fn(),
  };
});

const mockedExecuteSwap = vi.mocked(executeSwap);
const mockedToastSuccess = vi.mocked(toast.success);

describe('SwapCard', () => {
  beforeEach(() => {
    mockUseQuoteLoading.mockClear();

    mockedExecuteSwap.mockResolvedValue({
      success: true,
      message: 'Swapped 1 ETH → 3,000 USDC',
    });
  });

  describe('initial render', () => {
    it('should render the swap form with default tokens when mounted', () => {
      renderSwapCard();

      expect(
        screen.getByRole('heading', { name: 'Swap tokens' }),
      ).toBeInTheDocument();
      expect(screen.getByText('You pay')).toBeInTheDocument();
      expect(screen.getByText('You receive')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'ETH' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'USDC' })).toHaveLength(1);
    });

    it('should keep confirm swap disabled when pay amount is empty', () => {
      renderSwapCard();

      expect(getConfirmButton()).toBeDisabled();
    });

    it('should expose an accessible flip control when mounted', () => {
      renderSwapCard();

      expect(
        screen.getByRole('button', { name: 'Flip swap direction' }),
      ).toBeInTheDocument();
    });

    it('should mark the receive amount as read-only when mounted', () => {
      renderSwapCard();

      expect(getReceiveInput()).toHaveAttribute('readonly');
    });
  });

  describe('pay amount and quotes', () => {
    it('should pass the pay amount into the quote hook when user enters a value', async () => {
      const user = createUser();
      renderSwapCard();

      await user.click(getPayInput());
      await user.paste('1');

      await waitFor(() => {
        expect(mockUseQuoteLoading).toHaveBeenCalledWith('1');
        expect(screen.getByTitle('3,000')).toBeInTheDocument();
      });
    });

    it('should show pay USD value when user enters a valid amount', async () => {
      const user = createUser();
      renderSwapCard();

      await user.click(getPayInput());
      await user.paste('1');

      await waitFor(() => {
        expect(within(getPaySection()).getByText('$3,000.00')).toBeInTheDocument();
      });
    });

    it('should update receive amount when debounced quote settles', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');

      expect(getReceiveInput()).toHaveAttribute('title', '3,000');
    });

    it('should show exchange rate when debounced quote settles', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');

      expect(screen.getByText(/1 ETH ≈/)).toBeInTheDocument();
    });

    it('should show output hint when user has entered a settled pay amount', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');

      expect(
        screen.getByText('Output updates automatically from live USD prices.'),
      ).toBeVisible();
    });
  });

  describe('validation', () => {
    it('should keep confirm swap disabled when amount exceeds balance', async () => {
      const user = createUser();
      renderSwapCard();
      const overBalance = String(ETH_BALANCE + 1);

      await user.type(getPayInput(), overBalance);

      expect(getConfirmButton()).toBeDisabled();
    });

    it('should show balance error when amount exceeds balance after blur', async () => {
      const user = createUser();
      renderSwapCard();
      const payInput = getPayInput();
      const overBalance = String(ETH_BALANCE + 1);

      await user.type(payInput, overBalance);
      await user.tab();

      expect(
        await screen.findByText('Amount exceeds your available balance'),
      ).toBeInTheDocument();
      expect(payInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should enable confirm swap when amount is valid and within balance', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');

      await waitFor(() => {
        expect(getConfirmButton()).toBeEnabled();
      });
    });
  });

  describe('MAX action', () => {
    it('should fill pay amount with wallet balance when MAX is clicked', async () => {
      const user = createUser();
      renderSwapCard();

      await user.click(screen.getByRole('button', { name: 'MAX' }));

      expect(getPayInput()).toHaveValue(String(ETH_BALANCE));
    });
  });

  describe('flip direction', () => {
    it('should swap pay and receive tokens when flip is clicked', async () => {
      const user = createUser();
      renderSwapCard();

      await user.click(screen.getByRole('button', { name: 'Flip swap direction' }));

      const paySection = screen.getByText('You pay').parentElement?.parentElement;
      const receiveSection = screen.getByText('You receive').parentElement
        ?.parentElement;

      expect(paySection).toHaveTextContent('USDC');
      expect(receiveSection).toHaveTextContent('ETH');
    });

    it('should move settled receive into pay when flip is clicked after quote', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');
      await user.click(screen.getByRole('button', { name: 'Flip swap direction' }));

      await waitFor(() => {
        expect(getPayInput()).not.toHaveValue('');
      });
    });
  });

  describe('token change', () => {
    it('should clear pay amount when pay token changes', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');

      const [payTokenButton] = screen.getAllByRole('button', { name: 'ETH' });
      await user.click(payTokenButton);
      await user.click(await screen.findByRole('option', { name: /BTC/i }));

      expect(getPayInput()).toHaveValue('');
    });
  });

  describe('submit', () => {
    it('should call executeSwap and show success toast when swap succeeds', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');

      await waitFor(() => {
        expect(getConfirmButton()).toBeEnabled();
      });

      await user.click(getConfirmButton());

      expect(mockedExecuteSwap).toHaveBeenCalledWith(
        expect.objectContaining({
          fromSymbol: 'ETH',
          toSymbol: 'USDC',
          fromAmount: '1',
          receiveAmount: '3,000',
        }),
      );
      expect(mockedToastSuccess).toHaveBeenCalledWith(
        'Swapped 1 ETH → 3,000 USDC',
        { duration: 4500 },
      );
    });

    it('should clear pay amount after successful submit', async () => {
      const user = createUser();
      renderSwapCard();

      await enterPayAmount(user, '1');

      await waitFor(() => {
        expect(getConfirmButton()).toBeEnabled();
      });

      await user.click(getConfirmButton());

      expect(getPayInput()).toHaveValue('');
    });

    it('should show submitting label while swap is in progress', async () => {
      const user = createUser();
      let resolveSwap!: (value: { success: true; message: string }) => void;
      mockedExecuteSwap.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSwap = resolve;
          }),
      );

      renderSwapCard();

      await enterPayAmount(user, '1');

      await waitFor(() => {
        expect(getConfirmButton()).toBeEnabled();
      });

      await user.click(getConfirmButton());

      expect(
        screen.getByRole('button', { name: /Confirming swap/i }),
      ).toBeDisabled();

      resolveSwap({ success: true, message: 'done' });

      await waitFor(() => {
        expect(getConfirmButton()).toBeDisabled();
      });
    });

  });

  describe('accessibility', () => {
    it('should associate validation errors with the pay input when balance is exceeded', async () => {
      const user = createUser();
      renderSwapCard();
      const overBalance = String(ETH_BALANCE + 1);

      await user.type(getPayInput(), overBalance);
      await user.tab();

      const error = await screen.findByText('Amount exceeds your available balance');
      expect(error).toHaveAttribute('id', 'You pay-error');
      expect(getPayInput()).toHaveAttribute('aria-describedby', 'You pay-error');
    });
  });
});
