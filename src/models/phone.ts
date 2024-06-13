import { phone } from "phone";

export function formatPhoneNumber(rawNumber: string): string | null {
  if (import.meta.env.DEV && rawNumber.match(/(5.*){10}/))
    return "+15555555555";
  const { phoneNumber } = phone(rawNumber);
  return phoneNumber;
}

export function isPhoneNumberValid(rawNumber: string): boolean {
  if (import.meta.env.DEV && rawNumber.match(/(5.*){10}/)) return true;
  const { isValid } = phone(rawNumber);
  return isValid;
}
