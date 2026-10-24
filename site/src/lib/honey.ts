/**
 * The forms' honeypot (`_honey`, hidden off-screen). A filled honeypot alone
 * is not enough to drop a submission: browsers' autofill can fill it for a
 * real person (Jirel's own voucher test, 24.10.26, went nowhere), so it only
 * counts as a bot when the form also went out within seconds of the page
 * loading — something no person filling in a form does.
 */
export const looksLikeBot = (data: FormData): boolean =>
  !!data.get('_honey') && performance.now() < 5000;
