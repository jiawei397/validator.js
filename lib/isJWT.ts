import assertString from "./util/assertString.ts";
import isBase64 from "./isBase64.ts";

export default function isJWT(str: string) {
  assertString(str);

  const dotSplit = str.split(".");
  const len = dotSplit.length;

  if (len > 3 || len < 2) {
    return false;
  }

  return dotSplit.reduce(
    (acc, currElem) => acc && isBase64(currElem, { urlSafe: true }),
    true,
  );
}
