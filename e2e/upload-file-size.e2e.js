/* eslint-env jest */
/* global device, element, by, waitFor, expect */
const { launchApp } = require('./helpers/launch');

jest.setTimeout(180000);

describe('Upload file size guard', () => {
  afterEach(async () => {
    try {
      await device.terminateApp();
    } catch {
      // ignore
    }
  });

  it('shows an early error when a selected file is larger than 1 GB', async () => {
    await launchApp({
      routeName: 'UploadDetailsScreen',
      routeParams: {
        competition: { id: 'event-oversize-1', name: 'Oversize test' },
        category: { name: 'Sprint' },
        e2eFixtureFiles: [
          {
            uri: 'file:///tmp/oversized-video.mov',
            type: 'video/quicktime',
            fileName: 'OVERSIZED_VIDEO.MOV',
            fileSize: 1024 * 1024 * 1024 + 1,
          },
        ],
      },
      deleteApp: true,
      launchArgs: {
        detoxEnableSynchronization: 0,
      },
    });

    await waitFor(element(by.id('upload-details-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await waitFor(element(by.id('upload-size-error')))
      .toBeVisible()
      .withTimeout(30000);
    await expect(
      element(by.text('Skipped Oversized Video because it is 1.0 GB. Max upload size is 1 GB.')),
    ).toBeVisible();
    await expect(element(by.id('upload-selected-assets-ready'))).not.toBeVisible();
  });
});
