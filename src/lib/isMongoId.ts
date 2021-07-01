import assertString from "./util/assertString.ts";

import isHexadecimal from "./isHexadecimal";

export default function isMongoId(str: string) {
  assertString(str);
  return isHexadecimal(str) && str.length === 24;
}
