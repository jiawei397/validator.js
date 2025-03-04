import assertString from "./util/assertString.ts";

export const vatMatchers = {
  GB:
    /^GB((\d{3} \d{4} ([0-8][0-9]|9[0-6]))|(\d{9} \d{3})|(((GD[0-4])|(HA[5-9]))[0-9]{2}))$/,
  IT: /^(IT)?[0-9]{11}$/,
};

type CountryCode = keyof typeof vatMatchers;

export default function isVAT(str: string, countryCode: CountryCode) {
  assertString(str);
  assertString(countryCode);

  if (countryCode in vatMatchers) {
    return vatMatchers[countryCode].test(str);
  }
  throw new Error(`Invalid country code: '${countryCode}'`);
}
