/** Package metadata is authoritative for the built application's display version. */
export function releaseVersion(source, version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid release version');
  const marker=/const APP_VERSION = '[^']+';/g;
  if ([...source.matchAll(marker)].length!==1) throw new Error('Expected one UI version declaration');
  return source.replace(marker, `const APP_VERSION = '${version}';`);
}
