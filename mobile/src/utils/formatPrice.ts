export function formatPrice(amount: string | number, currencyCode: string = 'INR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (currencyCode === 'INR') return `\u20B9${num.toFixed(0)}`;
  return `${currencyCode} ${num.toFixed(2)}`;
}
