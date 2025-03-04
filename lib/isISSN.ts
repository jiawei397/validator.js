import assertString from "./util/assertString.ts";

const issn = "^\\d{4}-?\\d{3}[\\dX]$";

export default function isISSN(str: string, options: any = {}) {
  assertString(str);
  let testIssn = issn;
  testIssn = options.require_hyphen ? testIssn.replace("?", "") : testIssn;
  const reg = options.case_sensitive
    ? new RegExp(testIssn)
    : new RegExp(testIssn, "i");
  if (!reg.test(str)) {
    return false;
  }
  const digits = str.replace("-", "").toUpperCase();
  let checksum = 0;
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    checksum += (digit === "X" ? 10 : +digit) * (8 - i);
  }
  return checksum % 11 === 0;
}
