export function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

export function cidrToMaskInt(cidr) {
  if (cidr === 0) return 0;
  return (~0 << (32 - cidr)) >>> 0;
}

export function cidrToSubnetMask(cidr) {
  return intToIp(cidrToMaskInt(cidr));
}

export function cidrToWildcard(cidr) {
  return intToIp(~cidrToMaskInt(cidr) >>> 0);
}

export function intToBinary(int, grouped = true) {
  const bin = int.toString(2).padStart(32, '0');
  if (!grouped) return bin;
  return [bin.slice(0, 8), bin.slice(8, 16), bin.slice(16, 24), bin.slice(24, 32)].join('.');
}

export function intToHex(int) {
  return '0x' + int.toString(16).padStart(8, '0');
}

export function getIpClass(firstOctet) {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet === 127) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D';
  return 'E';
}

export function getIpType(ipInt) {
  const a = (ipInt >>> 24) & 255;
  const b = (ipInt >>> 16) & 255;

  if (a === 10) return 'Private';
  if (a === 172 && b >= 16 && b <= 31) return 'Private';
  if (a === 192 && b === 168) return 'Private';
  if (a === 127) return 'Loopback';
  if (a === 0) return 'Reserved';
  if (a >= 224 && a <= 239) return 'Multicast';
  if (a >= 240) return 'Reserved';
  return 'Public';
}

export function getInAddrArpa(ip) {
  return ip.split('.').reverse().join('.') + '.in-addr.arpa';
}

export function getIPv4MappedAddress(ipInt) {
  const hex = ipInt.toString(16).padStart(8, '0');
  return '::ffff:' + hex.slice(0, 4) + ':' + hex.slice(4);
}

export function get6to4Prefix(ipInt) {
  const hex = ipInt.toString(16).padStart(8, '0');
  return '2002:' + hex.slice(0, 4) + ':' + hex.slice(4) + '::/48';
}

export function isValidIPv4(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
}

export function calculateIPv4(ipStr, cidr) {
  const ipInt = ipToInt(ipStr);
  const maskInt = cidrToMaskInt(cidr);
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | ~maskInt) >>> 0;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? 0 : totalHosts - 2;
  const firstOctet = (ipInt >>> 24) & 255;

  let usableRange = 'NA';
  if (cidr < 31) {
    usableRange = intToIp(networkInt + 1) + ' - ' + intToIp(broadcastInt - 1);
  }

  return {
    ipAddress: ipStr,
    networkAddress: intToIp(networkInt),
    usableHostRange: usableRange,
    broadcastAddress: intToIp(broadcastInt),
    totalHosts,
    usableHosts,
    subnetMask: cidrToSubnetMask(cidr),
    wildcardMask: cidrToWildcard(cidr),
    binarySubnetMask: intToBinary(maskInt),
    ipClass: getIpClass(firstOctet),
    cidrNotation: '/' + cidr,
    ipType: getIpType(ipInt),
    short: ipStr + ' /' + cidr,
    binaryId: intToBinary(ipInt, false),
    integerId: ipInt,
    hexId: intToHex(ipInt),
    inAddrArpa: getInAddrArpa(ipStr),
    ipv4MappedAddress: getIPv4MappedAddress(ipInt),
    sixToFourPrefix: get6to4Prefix(ipInt),
  };
}

export function generateSubnetOptions() {
  const options = [];
  for (let i = 0; i <= 32; i++) {
    options.push({
      value: i,
      label: cidrToSubnetMask(i) + ' /' + i,
    });
  }
  return options;
}
