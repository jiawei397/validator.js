import assertString from "./util/assertString.ts";

import isFQDN from "./isFQDN.ts";
import isIP from "./isIP.ts";
import merge from "./util/merge.ts";

/*
options for isURL method

require_protocol - if set as true isURL will return false if protocol is not present in the URL
require_valid_protocol - isURL will check if the URL's protocol is present in the protocols option
protocols - valid protocols can be modified with this option
require_host - if set as false isURL will not check if host is present in the URL
require_port - if set as true isURL will check if port is present in the URL
allow_protocol_relative_urls - if set as true protocol relative URLs will be allowed
validate_length - if set as false isURL will skip string length validation (IE maximum is 2083)

*/

const default_url_options = {
  protocols: ["http", "https", "ftp"],
  require_tld: true,
  require_protocol: false,
  require_host: true,
  require_port: false,
  require_valid_protocol: true,
  allow_underscores: false,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  validate_length: true,
};

const wrapped_ipv6 = /^\[([^\]]+)\](?::([0-9]+))?$/;

function isRegExp(obj: any) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}

function checkHost(host: string, matches: any[]) {
  for (let i = 0; i < matches.length; i++) {
    let match = matches[i];
    if (host === match || (isRegExp(match) && match.test(host))) {
      return true;
    }
  }
  return false;
}

export default function isURL(url: string | undefined, options: any) {
  assertString(url);
  if (!url || /[\s<>]/.test(url)) {
    return false;
  }
  if (url.indexOf("mailto:") === 0) {
    return false;
  }
  options = merge(options, default_url_options);

  if (options.validate_length && url.length >= 2083) {
    return false;
  }

  let protocol, auth, host: string, hostname, port, port_str, split, ipv6: string | null;

  split = url.split("#");
  url = split.shift();

  split = url!.split("?");
  url = split.shift();

  split = url!.split("://");
  if (split.length > 1) {
    protocol = split.shift()!.toLowerCase();
    if (
      options.require_valid_protocol &&
      options.protocols.indexOf(protocol) === -1
    ) {
      return false;
    }
  } else if (options.require_protocol) {
    return false;
  } else if (url!.substr(0, 2) === "//") {
    if (!options.allow_protocol_relative_urls) {
      return false;
    }
    split[0] = url!.substr(2);
  }
  url = split.join("://");

  if (url === "") {
    return false;
  }

  split = url.split("/");
  url = split.shift();

  if (url === "" && !options.require_host) {
    return true;
  }

  split = url!.split("@");
  if (split.length > 1) {
    if (options.disallow_auth) {
      return false;
    }
    if (split[0] === "" || split[0].substr(0, 1) === ":") {
      return false;
    }
    auth = split.shift();
    if (auth!.indexOf(":") >= 0 && auth!.split(":").length > 2) {
      return false;
    }
  }
  hostname = split.join("@");

  port_str = null;
  ipv6 = null;
  const ipv6_match = hostname.match(wrapped_ipv6);
  if (ipv6_match) {
    host = "";
    ipv6 = ipv6_match[1];
    port_str = ipv6_match[2] || null;
  } else {
    split = hostname.split(":");
    host = split.shift()!;
    if (split.length) {
      port_str = split.join(":");
    }
  }

  if (port_str !== null) {
    port = parseInt(port_str, 10);
    if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
      return false;
    }
  } else if (options.require_port) {
    return false;
  }

  if (!isIP(host) && !isFQDN(host, options) && (!ipv6 || !isIP(ipv6, 6))) {
    return false;
  }

  let newHost = host || ipv6;

  if (options.host_whitelist && !checkHost(newHost!, options.host_whitelist)) {
    return false;
  }
  if (options.host_blacklist && checkHost(newHost!, options.host_blacklist)) {
    return false;
  }

  return true;
}
