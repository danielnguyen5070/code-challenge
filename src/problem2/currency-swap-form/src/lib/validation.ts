import { z } from 'zod';
import { parseAmountInput } from './format';
import { getMockBalance } from './tokens';

export const swapSchema = z
  .object({
    fromSymbol: z.string().min(1),
    toSymbol: z.string().min(1),
    fromAmount: z
      .string()
      .min(1, 'Enter an amount to swap')
      .refine((value) => (parseAmountInput(value) ?? 0) > 0, {
        message: 'Amount must be greater than zero',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.fromSymbol === data.toSymbol) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose two different tokens',
        path: ['toSymbol'],
      });
    }

    const amount = parseAmountInput(data.fromAmount) ?? 0;
    if (amount > getMockBalance(data.fromSymbol)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Amount exceeds your available balance',
        path: ['fromAmount'],
      });
    }
  });

export type SwapSchema = z.infer<typeof swapSchema>;
