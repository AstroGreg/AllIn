/* eslint-env jest */
/* global device */
const { launchApp } = require('./helpers/launch');

const pendingScenario = async ({
  routeName = 'HomeScreen',
  routeParams = {},
  authState = {},
  reason,
}) => {
  await launchApp({
    routeName,
    routeParams,
    authState,
  });

  throw new Error(
    [
      'Pending Detox regression scenario.',
      reason,
      'This test was intentionally scaffolded to fail until deterministic fixtures, route hooks, and testIDs are added for the full flow.',
    ].join(' '),
  );
};

describe.skip('Regression checklist', () => {
  it('1. group flow: create group, add photo to collection, add/delete blog, add/delete coach, generate share link', async () => {
    await pendingScenario({
      routeName: 'CreateGroupProfileScreen',
      authState: {
        userProfile: {
          category: 'group',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs seeded owner account, deterministic group fixtures, media-picker stubs, and testIDs across group create/profile/manage/news/collections.',
    });
  });

  it('2. upload competition flow: search competition, upload photo+video, verify profile downloads and searched discipline placement', async () => {
    await pendingScenario({
      routeName: 'RootUploadSelectCompetitionScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
          faceVerified: true,
        },
      },
      reason:
        'Needs seeded competition search fixtures, upload picker fixture media, upload success polling hooks, and assertions for downloads/profile/search discipline media placement.',
    });
  });

  it('3. subscription notifications: subscribe on one account, upload on another, verify notification delivery', async () => {
    await pendingScenario({
      routeName: 'CompetitionDetailsScreen',
      routeParams: {
        eventId: 'e2e-competition-id',
        competitionId: 'e2e-competition-id',
        name: 'E2E Competition',
      },
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs multi-account orchestration, seeded notification fixtures, and push/in-app notification observation hooks.',
    });
  });

  it('4. downloaded photo appears in downloaded photos on hub and home', async () => {
    await pendingScenario({
      routeName: 'DownloadsDetailsScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs deterministic purchased media fixture plus testIDs/assertions on home and hub downloaded-photo surfaces.',
    });
  });

  it('5. every video player entry point opens video playback correctly', async () => {
    await pendingScenario({
      routeName: 'VideoPlayingScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs enumerated video entry points, stable video fixtures, and shared playback assertions across all routes that open video players.',
    });
  });

  it('6. every photo player entry point opens photo playback correctly', async () => {
    await pendingScenario({
      routeName: 'PhotoDetailScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs enumerated photo entry points, stable media fixtures, and shared assertions for all routes that open photo detail/viewer screens.',
    });
  });

  it('7. report an issue on an upload and resolve it from the creator hub manage-upload flow', async () => {
    await pendingScenario({
      routeName: 'PhotoDetailScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs two-account upload ownership fixtures, report-issue testIDs, uploader hub/manage-upload fixtures, and resolution-status assertions.',
    });
  });

  it('8. profile milestone creation with real input appears on profile', async () => {
    await pendingScenario({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs deterministic profile fixture, milestone editor testIDs, and timeline/profile assertions for created milestone content.',
    });
  });

  it('9. profile blog creation with real input appears on profile', async () => {
    await pendingScenario({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs blog editor testIDs, deterministic post fixture cleanup, and profile news assertions for the created post.',
    });
  });

  it('10. following someone makes their videos/photos appear on overview', async () => {
    await pendingScenario({
      routeName: 'HomeScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs two-profile seeded follow graph, overview feed fixtures, and assertions that followed media enters the overview feed.',
    });
  });

  it('11. athlete type cannot be created twice for the same focus such as track and field', async () => {
    await pendingScenario({
      routeName: 'CategorySelectionScreen',
      routeParams: { fromAddFlow: true },
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs add-profile flow hooks and duplicate-athlete-type validation assertions in onboarding/settings profile creation.',
    });
  });

  it('12. settings can delete an athlete type', async () => {
    await pendingScenario({
      routeName: 'MenuScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field', 'road-events'],
        },
      },
      reason:
        'Needs settings/profile-type management testIDs and assertions that the deleted athlete type is removed everywhere.',
    });
  });

  it('13. settings can add a chest number for a new year for track and field', async () => {
    await pendingScenario({
      routeName: 'MenuScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
          chestNumbersByYear: { '2026': '6464' },
        },
      },
      reason:
        'Needs chest-number settings testIDs and profile-summary assertions that the new year/value pair persisted.',
    });
  });

  it('14. disabling push notifications in settings prevents notifications from appearing', async () => {
    await pendingScenario({
      routeName: 'MenuScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs notification preferences hooks plus deterministic notification injection/assertions for both in-app and push-disabled behavior.',
    });
  });

  it('15. profile can add, edit, and delete photo and video collections', async () => {
    await pendingScenario({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs collection management testIDs, deterministic media fixtures, and assertions across add/edit/delete for both photo and video collections.',
    });
  });

  it('16. AI search by chest number works with a known chest number for 5 photos', async () => {
    await pendingScenario({
      routeName: 'AISearchScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs seeded bib-detection fixtures and deterministic AI-search results assertions for exactly five matching photos.',
    });
  });

  it('17. event subscription by chest number triggers notification and hub appearances after later upload', async () => {
    await pendingScenario({
      routeName: 'CompetitionDetailsScreen',
      routeParams: {
        eventId: 'e2e-competition-id',
        competitionId: 'e2e-competition-id',
        name: 'E2E Competition',
      },
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
          chestNumbersByYear: { '2026': '6464' },
        },
      },
      reason:
        'Needs multi-account upload orchestration, bib-tagged media fixture, notification assertions, and hub appearances verification.',
    });
  });

  it('18. changing the profile picture updates the home profile picture too', async () => {
    await pendingScenario({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs avatar picker fixture, profile-save hooks, and assertions on both profile and home header avatar surfaces.',
    });
  });

  it('19. downloading a photo increases creator downloads and profit metrics', async () => {
    await pendingScenario({
      routeName: 'PhotoDetailScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs buyer and creator account fixtures, deterministic priced media, and assertions in creator profile downloads/profit views.',
    });
  });

  it('20. switching between fan, group, and athlete profiles is possible', async () => {
    await pendingScenario({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs multi-profile account fixture and profile-switcher testIDs with assertions for fan, group, and athlete transitions.',
    });
  });

  it('21. switching between light mode and dark mode works', async () => {
    await pendingScenario({
      routeName: 'MenuScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs theme-setting toggles exposed to Detox plus stable assertions for visible light/dark UI changes.',
    });
  });

  it('22. editing bio in profile section works', async () => {
    await pendingScenario({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
          bio: 'Old e2e bio',
        },
      },
      reason:
        'Needs bio-edit test IDs to be standardized across entry points and persisted-profile assertions after save.',
    });
  });

  it('23. adding a website to profile works', async () => {
    await pendingScenario({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
          website: '',
        },
      },
      reason:
        'Needs website editor testIDs and assertions that the new website appears and opens from the profile.',
    });
  });

  it('24. when someone tags someone in a blog it appears in the tagged person news feed', async () => {
    await pendingScenario({
      routeName: 'ProfileBlogEditorScreen',
      routeParams: { mode: 'add' },
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs two-profile blog-tagging fixtures, tagged-profile picker testIDs, and target-profile news assertions.',
    });
  });

  it('25. add to profile from media adds the photo to the news section of that profile', async () => {
    await pendingScenario({
      routeName: 'PhotoDetailScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs deterministic media fixture, add-to-profile action testIDs, and profile news assertions for created photo posts.',
    });
  });

  it('26. downloading a photo or video from the video player works', async () => {
    await pendingScenario({
      routeName: 'VideoPlayingScreen',
      authState: {
        userProfile: {
          category: 'athlete',
          selectedEvents: ['track-field'],
        },
      },
      reason:
        'Needs stable player route fixtures plus download/share assertions for both video and photo download actions from playback screens.',
    });
  });
});
