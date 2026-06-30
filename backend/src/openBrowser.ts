// Cross-platform "open URL in default browser" with zero dependencies.

import { spawn } from 'node:child_process';

/**
 * Best-effort: never throws. On headless boxes / SSH it simply does nothing.
 * Windows: `cmd /c start "" <url>` — the empty title arg prevents a leading `/`
 * in the URL from being parsed as a switch.
 */
export function openBrowser(url: string): void {
  let cmd: string;
  let args: string[];
  if (process.platform === 'win32') {
    cmd = 'cmd.exe';
    args = ['/c', 'start', '""', url];
  } else if (process.platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else {
    cmd = 'xdg-open';
    args = [url];
  }
  try {
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  } catch {
    /* ignore */
  }
}
