export function parseIPv6(ip) {
  ip = ip.trim();
  let groups;

  if (ip.includes('::')) {
    const parts = ip.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - left.length - right.length;
    groups = [
      ...left.map((g) => parseInt(g, 16)),
      ...Array(missing).fill(0),
      ...right.map((g) => parseInt(g, 16)),
    ];
  } else {
    groups = ip.split(':').map((g) => parseInt(g, 16));
  }

  return groups;
}

export function groupsToFull(groups) {
  return groups.map((g) => g.toString(16).padStart(4, '0')).join(':');
}

export function groupsToShort(groups) {
  const hexGroups = groups.map((g) => g.toString(16));

  let bestStart = -1,
    bestLen = 0,
    curStart = -1,
    curLen = 0;

  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen >= 2) {
    const left = hexGroups.slice(0, bestStart).join(':');
    const right = hexGroups.slice(bestStart + bestLen).join(':');
    return left + '::' + right;
  }

  return hexGroups.join(':');
}

export function groupsToPaddedShort(groups) {
  const hexGroups = groups.map((g) => g.toString(16).padStart(4, '0'));

  let bestStart = -1,
    bestLen = 0,
    curStart = -1,
    curLen = 0;

  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen >= 2) {
    const left = hexGroups.slice(0, bestStart).join(':');
    const right = hexGroups.slice(bestStart + bestLen).join(':');
    return left + '::' + right;
  }

  return hexGroups.join(':');
}

export function groupsToBigInt(groups) {
  let result = 0n;
  for (const g of groups) {
    result = (result << 16n) | BigInt(g);
  }
  return result;
}

export function bigIntToGroups(bi) {
  const groups = [];
  for (let i = 0; i < 8; i++) {
    groups.unshift(Number(bi & 0xffffn));
    bi >>= 16n;
  }
  return groups;
}

function prefixToMask(prefix) {
  if (prefix === 0) return 0n;
  const allOnes = (1n << 128n) - 1n;
  return (allOnes << BigInt(128 - prefix)) & allOnes;
}

export function calculateNetwork(groups, prefix) {
  const ipBig = groupsToBigInt(groups);
  const mask = prefixToMask(prefix);
  return bigIntToGroups(ipBig & mask);
}

export function calculateRange(networkGroups, prefix) {
  const networkBig = groupsToBigInt(networkGroups);
  const hostBits = 128 - prefix;
  const lastBig = networkBig | ((1n << BigInt(hostBits)) - 1n);
  return {
    first: networkGroups,
    last: bigIntToGroups(lastBig),
  };
}

export function totalIPs(prefix) {
  return 2n ** BigInt(128 - prefix);
}

export function formatBigInt(bi) {
  return bi.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function isValidIPv6(ip) {
  ip = ip.trim();
  if (!ip) return false;

  if ((ip.match(/::/g) || []).length > 1) return false;

  if (ip.includes('::')) {
    const parts = ip.split('::');
    if (parts.length !== 2) return false;
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    if (left.length + right.length > 7) return false;
    const allGroups = [...left, ...right];
    return allGroups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
  }

  const groups = ip.split(':');
  if (groups.length !== 8) return false;
  return groups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
}

export function formatNetworkAddress(groups, prefix) {
  const fullGroups = Math.floor(prefix / 16);
  const remainingBits = prefix % 16;
  const showGroups = remainingBits > 0 ? fullGroups + 1 : fullGroups;

  const parts = groups
    .slice(0, showGroups)
    .map((g) => g.toString(16).padStart(4, '0'));

  const remaining = groups.slice(showGroups);
  const allZero = remaining.every((g) => g === 0);

  if (allZero && showGroups < 8) {
    return parts.join(':') + '::';
  }

  const rest = remaining.map((g) => g.toString(16).padStart(4, '0'));
  return [...parts, ...rest].join(':');
}

export function calculateIPv6(ipStr, prefix) {
  const groups = parseIPv6(ipStr);
  const networkGroups = calculateNetwork(groups, prefix);
  const range = calculateRange(networkGroups, prefix);
  const total = totalIPs(prefix);
  const shortForm = groupsToShort(groups);

  return {
    ipAddress: shortForm + '/' + prefix,
    fullIpAddress: groupsToFull(groups),
    totalIpAddresses: formatBigInt(total),
    network: formatNetworkAddress(networkGroups, prefix),
    ipRange:
      groupsToFull(range.first) + ' - ' + groupsToFull(range.last),
  };
}

export function generatePrefixOptions() {
  const options = [];
  for (let i = 0; i <= 128; i++) {
    options.push({ value: i, label: '/' + i });
  }
  return options;
}
