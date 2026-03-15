import React from 'react';
import {Image} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import RNFS from 'react-native-fs';

import InstagramStoryComposer, {
  useInstagramStoryImageComposer,
} from '../src/components/share/InstagramStoryComposer';

const mockToDataURL = jest.fn();

jest.mock('react-native-fs', () => ({
  __esModule: true,
  default: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    CachesDirectoryPath: '/tmp',
  },
  writeFile: jest.fn().mockResolvedValue(undefined),
  CachesDirectoryPath: '/tmp',
}));

jest.mock('react-native-svg', () => {
  const ReactModule = require('react');

  const createMockComponent = (name: string, _options?: {withRef?: boolean}) => {
    const Component = ReactModule.forwardRef((props: any, ref: any) => {
      ReactModule.useImperativeHandle(
        ref,
        () => ({
          toDataURL: mockToDataURL,
        }),
        [],
      );
      return ReactModule.createElement(name, props, props.children);
    });
    Component.displayName = name;
    return Component;
  };

  return {
    __esModule: true,
    default: createMockComponent('Svg', {withRef: true}),
    ClipPath: createMockComponent('ClipPath'),
    Defs: createMockComponent('Defs'),
    Image: createMockComponent('SvgImage'),
    LinearGradient: createMockComponent('LinearGradient'),
    Rect: createMockComponent('Rect'),
    Stop: createMockComponent('Stop'),
    Text: createMockComponent('SvgText'),
    TSpan: createMockComponent('TSpan'),
  };
});

function createRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'req-1',
    imageUri: 'https://example.com/background.jpg',
    title: 'BK Indoor 2026',
    subtitle: 'Face + Chest',
    appName: 'SpotMe',
    mode: 'background',
    layout: 'home_media_card',
    ...overrides,
  } as any;
}

function extractText(node: any): string {
  if (!node) {
    return '';
  }
  if (typeof node === 'string') {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }
  if ('children' in node) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function findFullScreenBackgroundImages(root: ReactTestRenderer.ReactTestInstance, uri: string) {
  return root.findAll(
    (node) =>
      node.type === 'SvgImage' &&
      node.props.x === 0 &&
      node.props.y === 0 &&
      node.props.width === 1080 &&
      node.props.height === 1920 &&
      node.props.href?.uri === uri,
  );
}

function findFullScreenRects(root: ReactTestRenderer.ReactTestInstance, fill: string) {
  return root.findAll(
    (node) =>
      node.type === 'Rect' &&
      node.props.x === 0 &&
      node.props.y === 0 &&
      node.props.width === 1080 &&
      node.props.height === 1920 &&
      node.props.fill === fill,
  );
}

async function flushStoryExport() {
  await act(async () => {
    jest.advanceTimersByTime(180);
  });
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('InstagramStoryComposer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockToDataURL.mockReset();
    mockToDataURL.mockImplementation((callback: (value: string) => void) => callback('mock-base64'));
    jest.spyOn(Image, 'resolveAssetSource').mockReturnValue({uri: 'asset://spotme-mark'} as any);
    jest.spyOn(Image, 'getSize').mockImplementation((uri: string, success?: any) => {
      success?.(1080, 1920);
    });
    (RNFS.writeFile as jest.Mock).mockReset();
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders nothing when there is no request', () => {
    const renderer = ReactTestRenderer.create(
      <InstagramStoryComposer request={null} onComplete={jest.fn()} onError={jest.fn()} />,
    );

    expect(renderer.toJSON()).toBeNull();
  });

  it('renders a visible full-screen background image for home media cards and exports after load', async () => {
    const onComplete = jest.fn();
    const onError = jest.fn();
    const request = createRequest();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <InstagramStoryComposer request={request} onComplete={onComplete} onError={onError} />,
      );
    });

    expect(extractText(renderer!.root)).toContain('Event: BK Indoor 2026');
    expect(extractText(renderer!.root)).toContain('Match: Face + Chest');
    expect(extractText(renderer!.root)).toContain('Get your race photos on SpotMe');

    const backgroundImages = findFullScreenBackgroundImages(renderer!.root, request.imageUri);
    expect(backgroundImages).toHaveLength(1);

    await act(async () => {
      backgroundImages[0].props.onLoad();
    });
    await flushStoryExport();

    expect(mockToDataURL).toHaveBeenCalledWith(expect.any(Function), {width: 1080, height: 1920});
    expect(RNFS.writeFile).toHaveBeenCalledWith(
      '/tmp/instagram-story-req-1.png',
      'mock-base64',
      'base64',
    );
    expect(onComplete).toHaveBeenCalledWith('file:///tmp/instagram-story-req-1.png');
    expect(onError).not.toHaveBeenCalled();
  });

  it('stops the home story export when the image fails to load', async () => {
    const onComplete = jest.fn();
    const onError = jest.fn();
    const request = createRequest();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <InstagramStoryComposer request={request} onComplete={onComplete} onError={onError} />,
      );
    });

    expect(findFullScreenBackgroundImages(renderer!.root, request.imageUri)).toHaveLength(1);
    expect(findFullScreenRects(renderer!.root, 'rgba(4,10,16,0.18)')).toHaveLength(1);
    expect(findFullScreenRects(renderer!.root, 'url(#homeCardFade)')).toHaveLength(1);

    await act(async () => {
      findFullScreenBackgroundImages(renderer!.root, request.imageUri)[0].props.onError();
    });
    await flushStoryExport();

    expect(findFullScreenBackgroundImages(renderer!.root, request.imageUri)).toHaveLength(0);
    expect(findFullScreenRects(renderer!.root, 'rgba(4,10,16,0.18)')).toHaveLength(0);
    expect(findFullScreenRects(renderer!.root, 'url(#homeCardFade)')).toHaveLength(0);
    expect(findFullScreenRects(renderer!.root, 'rgba(0,0,0,0)')).not.toHaveLength(0);
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Could not load image for Instagram Story sharing.',
      }),
    );
  });

  it('exports the badge overlay layout without waiting for an image load event', async () => {
    const onComplete = jest.fn();
    const onError = jest.fn();
    const request = createRequest({
      id: 'overlay-badge',
      imageUri: 'https://example.com/ignored.jpg',
      mode: 'overlay',
      layout: 'badge',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <InstagramStoryComposer request={request} onComplete={onComplete} onError={onError} />,
      );
    });
    await flushStoryExport();

    expect(extractText(renderer!.root)).toContain('SpotMe');
    expect(findFullScreenBackgroundImages(renderer!.root, request.imageUri)).toHaveLength(0);
    expect(findFullScreenRects(renderer!.root, 'rgba(0,0,0,0)')).not.toHaveLength(0);
    expect(onComplete).toHaveBeenCalledWith('file:///tmp/instagram-story-overlay-badge.png');
    expect(onError).not.toHaveBeenCalled();
  });

  it('renders the blog card framed image and exports it after the image loads', async () => {
    const onComplete = jest.fn();
    const onError = jest.fn();
    const request = createRequest({
      id: 'blog-1',
      imageUri: 'https://example.com/blog.jpg',
      title: 'How Thierry prepared for the indoor season',
      subtitle: 'A behind-the-scenes look at the training block and race day.',
      layout: 'blog_card',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <InstagramStoryComposer request={request} onComplete={onComplete} onError={onError} />,
      );
    });

    const blogImages = renderer!.root.findAll(
      (node) =>
        node.type === 'SvgImage' &&
        node.props.href?.uri === request.imageUri &&
        node.props.clipPath === 'url(#blogCardImageClip)',
    );

    const blogText = extractText(renderer!.root);

    expect(blogImages).toHaveLength(1);
    expect(findFullScreenRects(renderer!.root, '#122047')).toHaveLength(1);
    expect(blogText).toContain('How Thierry prepared for the');
    expect(blogText).toContain('indoor season');
    expect(blogText).toContain('A behind the scenes look at the training block and');
    expect(blogText).toContain('race day.');

    await act(async () => {
      blogImages[0].props.onLoad();
    });
    await flushStoryExport();

    expect(onComplete).toHaveBeenCalledWith('file:///tmp/instagram-story-blog-1.png');
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError when SVG export returns an empty payload', async () => {
    const onComplete = jest.fn();
    const onError = jest.fn();
    const request = createRequest({
      id: 'broken-export',
      mode: 'overlay',
      layout: 'badge',
      imageUri: null,
    });

    mockToDataURL.mockImplementation((callback: (value: string) => void) => callback(''));

    await act(async () => {
      ReactTestRenderer.create(
        <InstagramStoryComposer request={request} onComplete={onComplete} onError={onError} />,
      );
    });
    await flushStoryExport();

    expect(RNFS.writeFile).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Could not compose Instagram Story image.',
      }),
    );
  });

  it('resolves composition requests through useInstagramStoryImageComposer and clears the composer afterwards', async () => {
    let hookApi:
      | ReturnType<typeof useInstagramStoryImageComposer>
      | undefined;

    const Harness = () => {
      hookApi = useInstagramStoryImageComposer();
      return hookApi.composerElement;
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<Harness />);
    });

    let pendingResult: Promise<string> | undefined;
    await act(async () => {
      pendingResult = hookApi!.composeInstagramStoryImage(
        null,
        'Olympic Trials',
        'SpotMe',
        'Face + Chest',
        {mode: 'overlay', layout: 'home_media_overlay_card'},
      );
    });

    expect(extractText(renderer!.root)).toContain('Event: Olympic Trials');
    expect(extractText(renderer!.root)).toContain('Match: Face + Chest');
    expect(extractText(renderer!.root)).toContain('Get your race photos on SpotMe');

    await flushStoryExport();

    await act(async () => {
      await expect(pendingResult!).resolves.toMatch(/^file:\/\/\/tmp\/instagram-story-/);
    });
    expect(renderer!.toJSON()).toBeNull();
  });
});
