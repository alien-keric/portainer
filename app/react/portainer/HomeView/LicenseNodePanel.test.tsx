import { http, HttpResponse } from 'msw';

import { server } from '@/setup-tests/server';
import { renderWithQueryClient } from '@/react-tools/test-utils';

import { LicenseType } from '../licenses/types';

import { LicenseNodePanel } from './LicenseNodePanel';

test('when user is using more nodes then allowed he should see message', async () => {
  const allowed = 2;
  const used = 5;
  server.use(
    http.get('/api/licenses/info', () =>
      HttpResponse.json({ nodes: allowed, type: LicenseType.Subscription })
    ),
    http.get('/api/system/nodes', () => HttpResponse.json({ nodes: used }))
  );

  const { findByText } = renderWithQueryClient(<LicenseNodePanel />);

  await expect(
    findByText(
      /The number of nodes for your license has been exceeded. Please contact your administrator./
    )
  ).resolves.toBeVisible();
});

test("when user is using less nodes then allowed he shouldn't see message", async () => {
  const allowed = 5;
  const used = 2;
  server.use(
    http.get('/api/licenses/info', () =>
      HttpResponse.json({ nodes: allowed, type: LicenseType.Subscription })
    ),
    http.get('/api/system/nodes', () => HttpResponse.json({ nodes: used }))
  );

  const { findByText } = renderWithQueryClient(<LicenseNodePanel />);

  await expect(
    findByText(
      /The number of nodes for your license has been exceeded. Please contact your administrator./
    )
  ).rejects.toBeTruthy();
});
