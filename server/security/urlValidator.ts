import dns from 'dns/promises';
import { REVO_CONFIG } from '../config.js';

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
  isSsrfViolation?: boolean;
}

/**
 * Checks if an IPv4 address belongs to a private, loopback, link-local, or cloud metadata range.
 */
export function isPrivateOrDisallowedIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format treated as unsafe
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 (Broadcast/Current network)
  if (a === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private network)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata, e.g., 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 100.64.0.0/10 (Carrier Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET)
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address is loopback, unique local, link-local, or IPv4-mapped.
 */
export function isPrivateOrDisallowedIPv6(ip: string): boolean {
  const cleanIp = ip.toLowerCase();

  // Loopback ::1 or ::
  if (cleanIp === '::1' || cleanIp === '::' || cleanIp === '0:0:0:0:0:0:0:1') return true;

  // Link-local fe80::/10
  if (cleanIp.startsWith('fe8') || cleanIp.startsWith('fe9') || cleanIp.startsWith('fea') || cleanIp.startsWith('feb')) {
    return true;
  }

  // Unique local fc00::/7 (fc00:: and fd00::)
  if (cleanIp.startsWith('fc') || cleanIp.startsWith('fd')) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (cleanIp.includes('::ffff:')) {
    const ipv4Part = cleanIp.split('::ffff:')[1];
    if (ipv4Part && !isPrivateOrDisallowedIPv4(ipv4Part)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Validates and normalizes user-provided URLs with strict SSRF & DNS resolution verification.
 */
export async function validateAndNormalizeUrl(rawInput: string): Promise<UrlValidationResult> {
  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, error: 'A valid website URL is required.' };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length > REVO_CONFIG.SECURITY.MAX_URL_LENGTH) {
    return { isValid: false, error: 'URL exceeds maximum allowable length (2048 characters).' };
  }

  // Check for forbidden scheme prefixes before normalization
  const lowercase = trimmed.toLowerCase();
  if (
    lowercase.startsWith('file:') ||
    lowercase.startsWith('ftp:') ||
    lowercase.startsWith('gopher:') ||
    lowercase.startsWith('javascript:') ||
    lowercase.startsWith('data:') ||
    lowercase.startsWith('vbscript:')
  ) {
    return {
      isValid: false,
      isSsrfViolation: true,
      error: 'Unsupported protocol. REVO only inspects public HTTP and HTTPS websites.',
    };
  }

  let urlCandidate = trimmed;
  if (!urlCandidate.startsWith('http://') && !urlCandidate.startsWith('https://')) {
    urlCandidate = 'https://' + urlCandidate;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlCandidate);
  } catch {
    return { isValid: false, error: 'Malformed or unparseable URL format.' };
  }

  // Enforce allowed protocols
  if (!REVO_CONFIG.SECURITY.ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return {
      isValid: false,
      isSsrfViolation: true,
      error: `Protocol "${parsed.protocol}" is not supported. Use http: or https:`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block obvious internal or local hostnames
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data'
  ) {
    return {
      isValid: false,
      isSsrfViolation: true,
      error: 'Restricted destination: Local and internal network addresses cannot be inspected.',
    };
  }

  // Check if hostname is directly an IPv4 literal
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    if (isPrivateOrDisallowedIPv4(hostname)) {
      return {
        isValid: false,
        isSsrfViolation: true,
        error: 'Restricted destination: Private IP ranges and cloud metadata endpoints cannot be inspected.',
      };
    }
  }

  // Check if hostname is an IPv6 literal
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const rawIpv6 = hostname.slice(1, -1);
    if (isPrivateOrDisallowedIPv6(rawIpv6)) {
      return {
        isValid: false,
        isSsrfViolation: true,
        error: 'Restricted destination: Local or private IPv6 destinations cannot be inspected.',
      };
    }
  }

  // DNS Resolution Validation: Verify that domain does not resolve to a private/loopback IP (DNS Rebinding/SSRF)
  let resolvedRecords: { address: string; family: number }[] = [];
  let effectiveHostname = hostname;

  try {
    const lookupResults = await dns.lookup(hostname, { all: true });
    resolvedRecords = lookupResults;
  } catch (primaryDnsErr) {
    // If not prefixed with www, attempt www. fallback
    if (!hostname.startsWith('www.') && !ipv4Regex.test(hostname)) {
      try {
        const wwwLookup = await dns.lookup(`www.${hostname}`, { all: true });
        resolvedRecords = wwwLookup;
        effectiveHostname = `www.${hostname}`;
        parsed.hostname = effectiveHostname;
      } catch {
        // Fallback to DoH check below
      }
    }

    // If system DNS failed, try Google DoH with a quick timeout in case container resolver has transient issues
    if (resolvedRecords.length === 0) {
      try {
        const dohController = new AbortController();
        const timeout = setTimeout(() => dohController.abort(), 2000);
        const dohRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`, {
          signal: dohController.signal,
        });
        clearTimeout(timeout);
        if (dohRes.ok) {
          const dohData: any = await dohRes.json();
          if (dohData.Answer && Array.isArray(dohData.Answer)) {
            for (const ans of dohData.Answer) {
              if (ans.type === 1 && typeof ans.data === 'string') {
                resolvedRecords.push({ address: ans.data, family: 4 });
              } else if (ans.type === 28 && typeof ans.data === 'string') {
                resolvedRecords.push({ address: ans.data, family: 6 });
              }
            }
          }
        }
      } catch {
        // DoH also failed
      }
    }

    // If still no records resolved, domain is non-existent
    if (resolvedRecords.length === 0) {
      return {
        isValid: false,
        error: `Could not resolve hostname "${hostname}". Please check that the domain name is spelled correctly and is publicly accessible.`,
      };
    }
  }

  for (const record of resolvedRecords) {
    if (record.family === 4 && isPrivateOrDisallowedIPv4(record.address)) {
      return {
        isValid: false,
        isSsrfViolation: true,
        error: 'Restricted destination: Target domain resolves to a protected or internal IP address.',
      };
    }
    if (record.family === 6 && isPrivateOrDisallowedIPv6(record.address)) {
      return {
        isValid: false,
        isSsrfViolation: true,
        error: 'Restricted destination: Target domain resolves to a protected or internal IPv6 address.',
      };
    }
  }

  return {
    isValid: true,
    normalizedUrl: parsed.href,
  };
}

/**
 * Synchronous check for subresource requests (images, scripts, iframes) in Playwright route interception.
 * Returns true if URL is restricted (SSRF risk), false if safe.
 */
export function isUrlRestrictedSync(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return true;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return true;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:' && parsed.protocol !== 'data:') {
    return true;
  }

  if (parsed.protocol === 'data:') return false;

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data' ||
    hostname === '169.254.169.254'
  ) {
    return true;
  }

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    if (isPrivateOrDisallowedIPv4(hostname)) return true;
  }

  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const rawIpv6 = hostname.slice(1, -1);
    if (isPrivateOrDisallowedIPv6(rawIpv6)) return true;
  }

  return false;
}
