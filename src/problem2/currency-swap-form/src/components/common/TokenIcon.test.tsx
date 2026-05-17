import { resolveTokenIcon } from '@services';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenIcon } from './TokenIcon';

vi.mock('@services', () => ({
  resolveTokenIcon: vi.fn(),
}));

const mockedResolveTokenIcon = vi.mocked(resolveTokenIcon);

describe('TokenIcon', () => {
  beforeEach(() => {
    mockedResolveTokenIcon.mockReset();
  });

  it('should show symbol initials when icon URL is not available', () => {
    mockedResolveTokenIcon.mockResolvedValue(undefined);

    render(<TokenIcon symbol="ETH" />);

    expect(screen.getByText('ET')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render an image when icon URL resolves', async () => {
    mockedResolveTokenIcon.mockResolvedValue('/icons/eth.svg');

    const { container } = render(<TokenIcon symbol="ETH" />);

    await waitFor(() => {
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/icons/eth.svg');
    });
    expect(screen.queryByText('ET')).not.toBeInTheDocument();
  });

  it('should request the icon again when symbol changes', async () => {
    mockedResolveTokenIcon.mockResolvedValue(undefined);

    const { rerender } = render(<TokenIcon symbol="ETH" />);

    await waitFor(() => {
      expect(mockedResolveTokenIcon).toHaveBeenCalledWith('ETH');
    });

    rerender(<TokenIcon symbol="USDC" />);

    await waitFor(() => {
      expect(mockedResolveTokenIcon).toHaveBeenCalledWith('USDC');
    });
    expect(screen.getByText('US')).toBeInTheDocument();
  });
});
