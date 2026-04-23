import { UserAddress } from '@/types';

function removeFalsy(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => Boolean(v)));
}

export function formatAddress(address: UserAddress) {
  if (!address) return '';
  const directFormattedAddress =
    (address as any)?.formatted_address || (address as any)?.formattedAddress;

  if (directFormattedAddress) {
    return directFormattedAddress;
  }

  const temp = ['street_address', 'city', 'state', 'zip', 'country'].reduce(
    (acc, k) => ({ ...acc, [k]: (address as any)[k] }),
    {}
  );
  const formattedAddress = removeFalsy(temp);
  return Object.values(formattedAddress).join(', ');
}
