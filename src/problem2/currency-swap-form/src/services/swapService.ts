import type { SwapRequest, SwapResult } from '@types';

const SUBMIT_DELAY_MS = 1800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function executeSwap(request: SwapRequest): Promise<SwapResult> {
  await delay(SUBMIT_DELAY_MS);

  return {
    success: true,
    message: `Swapped ${request.fromAmount} ${request.fromSymbol} → ${request.receiveAmount} ${request.toSymbol}`,
  };
}
