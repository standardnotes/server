export enum ProtocolVersion {
  V001 = '001',
  V002 = '002',
  V003 = '003',
  V004 = '004',
}

/**
 *  -1 if a < b
 *  0 if a == b
 *  1 if a > b
 */
function compareVersions(a: ProtocolVersion, b: ProtocolVersion): number {
  const aNum = Number(a)
  const bNum = Number(b)
  return aNum - bNum
}

export function leftVersionGreaterThanOrEqualToRight(a: ProtocolVersion, b: ProtocolVersion): boolean {
  return compareVersions(a, b) >= 0
}
