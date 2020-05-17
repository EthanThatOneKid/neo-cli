import Neo from './Neo';
import 'source-map-support/register';
import { getBrowserKey, getBrowserType, launchBrowser } from './playwright/helpers';
import downloadBrowser from './playwright/downloadBrowser';
import { loadSource as sourceLoader } from './loadSource/loadSourceAllowReadWrite';
import { defaultCommands, allowReadWriteCommands } from './commands';

const app = async ({ input, flags }) => {
  const headless = !flags.headful, dev = !!process.env.NODE;
  const browserKey = getBrowserKey(flags);
  const browserType = await getBrowserType(browserKey, { dev });
  if (flags.download) {
    await downloadBrowser(browserType);
    return process.exit();
  }
  const page = await launchBrowser(browserKey, browserType, headless);
  const [path] = input;
  const commands = { ...defaultCommands, ...allowReadWriteCommands };
  const neo = await Neo.load({ path, page, commands, sourceLoader });
  await neo.run();
  return process.exit();
};

export { app };