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

  const normalized = address as any;
  const street =
    normalized?.street_address ||
    normalized?.street ||
    normalized?.address1 ||
    normalized?.line1 ||
    '';
  const city = normalized?.city || '';
  const state = normalized?.state || normalized?.province || '';
  const zip = normalized?.zip || normalized?.zipCode || normalized?.zipcode || '';
  const country = normalized?.country || '';
  const temp = removeFalsy({ street, city, state, zip, country });
  const formattedAddress = removeFalsy(temp);
  return Object.values(formattedAddress).join(', ');
}
