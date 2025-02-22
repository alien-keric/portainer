import { http, HttpResponse } from 'msw';

import { server } from '@/setup-tests/server';
import { renderWithQueryClient } from '@/react-tools/test-utils';
import { isoDate } from '@/portainer/filters/filters';

import { BackupFailedPanel } from './BackupFailedPanel';

test('when backup failed, should show message', async () => {
  const timestamp = 1500;
  server.use(
    http.get('/api/backup/s3/status', () =>
      HttpResponse.json({ Failed: true, TimestampUTC: timestamp })
    )
  );

  const { findByText } = renderWithQueryClient(<BackupFailedPanel />);

  await expect(
    findByText(
      `The latest automated backup has failed at ${isoDate(
        timestamp
      )}. For details please see the log files and have a look at the`,
      { exact: false }
    )
  ).resolves.toBeVisible();
});

test("when user is using less nodes then allowed he shouldn't see message", async () => {
  server.use(
    http.get('/api/backup/s3/status', () =>
      HttpResponse.json({ Failed: false })
    )
  );
  const { findByText } = renderWithQueryClient(<BackupFailedPanel />);

  await expect(
    findByText('The latest automated backup has failed at', { exact: false })
  ).rejects.toBeTruthy();
});
