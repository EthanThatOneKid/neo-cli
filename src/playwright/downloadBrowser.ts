import ProgressBar from 'progress';

const toMegabytes = (bytes) => {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10} Mb`;
};

const downloadBrowser = async (browserType): Promise<void> => {
  let progressBar = null, lastDownloadedBytes = 0;
  const fetcher = browserType._createBrowserFetcher();
  const revisionInfo = fetcher.revisionInfo();
  if (revisionInfo.local) {
    return;
  }
  await browserType.downloadBrowserIfNeeded((downloadedBytes, total) => {
    if (!progressBar) {
      progressBar = new ProgressBar(`Downloading ${browserType._revision} - ${toMegabytes(total)} [:bar] :percent :etas `, {
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

export default downloadBrowser;