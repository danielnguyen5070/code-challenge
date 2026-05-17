import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUser, TEST_TOKENS } from '../../test/test-utils';
import { TokenPicker } from './TokenPicker';

vi.mock('framer-motion', () => import('../../test/mocks/framer-motion'));

vi.mock('@services', () => ({
  resolveTokenIcon: vi.fn().mockResolvedValue(undefined),
}));

function renderTokenPicker(
  props: Partial<{
    value: string;
    onChange: (symbol: string) => void;
    disabled: boolean;
    portaled: boolean;
  }> = {},
) {
  const onChange = props.onChange ?? vi.fn();

  return {
    onChange,
    ...render(
      <TokenPicker
        tokens={TEST_TOKENS}
        value={props.value ?? 'ETH'}
        onChange={onChange}
        disabled={props.disabled}
        portaled={props.portaled}
      />,
    ),
  };
}

async function openPicker(user: ReturnType<typeof createUser>) {
  await user.click(screen.getByRole('button', { name: 'ETH' }));
  expect(screen.getByRole('button', { name: 'ETH' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
}

describe('TokenPicker', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('closed state', () => {
    it('should render the selected token on the trigger when closed', () => {
      renderTokenPicker({ value: 'USDC' });

      expect(screen.getByRole('button', { name: 'USDC' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });
  });

  describe('open menu', () => {
    it('should list all tokens when the trigger is clicked', async () => {
      const user = createUser();
      renderTokenPicker();

      await openPicker(user);

      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getAllByRole('option')).toHaveLength(
        TEST_TOKENS.length,
      );
    });

    it('should call onChange and close when a token is selected', async () => {
      const user = createUser();
      const { onChange } = renderTokenPicker();

      await openPicker(user);
      await user.click(screen.getByRole('option', { name: /USDC/i }));

      expect(onChange).toHaveBeenCalledWith('USDC');
      expect(screen.getByRole('button', { name: 'ETH' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('should filter tokens when user searches', async () => {
      const user = createUser();
      renderTokenPicker();

      await openPicker(user);
      await user.type(screen.getByPlaceholderText('Search token'), 'btc');

      const options = within(screen.getByRole('listbox')).getAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('BTC');
    });

    it('should show empty state when search matches no tokens', async () => {
      const user = createUser();
      renderTokenPicker();

      await openPicker(user);
      await user.type(screen.getByPlaceholderText('Search token'), 'zzz');

      expect(screen.getByText('No tokens found')).toBeInTheDocument();
    });

    it('should close when clicking outside the picker', async () => {
      const user = createUser();
      renderTokenPicker();

      await openPicker(user);
      await user.click(document.body);

      expect(screen.getByRole('button', { name: 'ETH' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });
  });

  describe('disabled state', () => {
    it('should not open the menu when disabled', async () => {
      const user = createUser();
      renderTokenPicker({ disabled: true });

      await user.click(screen.getByRole('button', { name: 'ETH' }));

      expect(screen.getByRole('button', { name: 'ETH' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('portaled menu', () => {
    it('should render the menu in a portal when portaled is true', async () => {
      const user = createUser();
      const rect = {
        top: 100,
        left: 200,
        right: 488,
        bottom: 140,
        width: 288,
        height: 40,
        x: 200,
        y: 100,
        toJSON: () => ({}),
      };

      vi.spyOn(
        HTMLButtonElement.prototype,
        'getBoundingClientRect',
      ).mockReturnValue(rect as DOMRect);

      renderTokenPicker({ portaled: true });

      await user.click(screen.getByRole('button', { name: 'ETH' }));

      await waitFor(() => {
        const menu = document.body.querySelector('[role="listbox"]');
        expect(menu).toBeInTheDocument();
      });
    });
  });
});
