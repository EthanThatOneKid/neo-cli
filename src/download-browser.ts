import packageJson from 'playwright-core/package.json';
import ProgressBar from 'progress';
import { constants } from './maps/constants';
import path from 'path';
import fs from 'fs';

const getBrowserType = async (browserName: string): Promise<any> => {
  fs.mkdirSync(path.normalize(`${constants.DIST_DIR}.local-${browserName}`));
  return new (
    browserName === constants.CHROMIUM_BROWSER
    ? (await import(`playwright-core/lib/server/chromium`)).Chromium
    : browserName === constants.FIREFOX_BROWSER
      ? (await import(`playwright-core/lib/server/firefox`)).Firefox
      : browserName === constants.WEBKIT_BROWSER
        ? (await import(`playwright-core/lib/server/webkit`)).WebKit
        : (await import(`playwright-core/lib/server/chromium`)).Chromium
  )(constants.DIST_DIR, packageJson.playwright.chromium_revision);
};

const toMegabytes = (bytes) => {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10} Mb`;
};

const downloadBrowser = async (browserName: string): Promise<void> => {
  const browserType = await getBrowserType(browserName);
  let progressBar = null, lastDownloadedBytes = 0;
  const fetcher = browserType._createBrowserFetcher();
  const revisionInfo = fetcher.revisionInfo();
  if (revisionInfo.local) {
    return;
  }
  await browserType.downloadBrowserIfNeeded((downloadedBytes, total) => {
    if (!progressBar) {
      progressBar = new ProgressBar(`Downloading ${browserName} ${browserType._revision} - ${toMegabytes(total)} [:bar] :percent :etas `, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total
      });
    }
    const delta = downloadedBytes - lastDownloadedBytes;
    lastDownloadedBytes = downloadedBytes;
    progressBar.tick(delta);
  });
  return;
};

export { downloadBrowser };