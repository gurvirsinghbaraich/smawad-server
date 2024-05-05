export function concatinate(...strings: string[]): string {
  return strings.reduce((currentString, nextString) => {
    return currentString + nextString;
  }, "");
}
