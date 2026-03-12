/* eslint-env jest */
/* global device, element, by, expect */
const { launchApp } = require('./helpers/launch');

describe('Upload flow', () => {
  it('subscribes from the upload competition picker and opens competition details', async () => {
    await launchApp({
      routeName: 'RootUploadSelectCompetitionScreen',
      routeParams: {
        e2eCompetitionDetailsRouteName: 'RootUploadCompetitionDetailsScreen',
        e2eCompetitions: [
          {
            id: 'comp-1',
            name: 'E2E City Run',
            videoCount: 0,
            location: 'Leuven',
            date: '2026-01-11',
            competitionType: 'road',
          },
        ],
      },
    });

    await expect(element(by.id('upload-select-competition-screen'))).toBeVisible();
    await element(by.id('upload-competition-card-comp-1')).tap();
    await expect(element(by.id('upload-subscribe-confirm'))).toBeVisible();
    await element(by.id('upload-subscribe-confirm')).tap();
    await expect(element(by.id('upload-competition-details-screen'))).toBeVisible();
  });
});
