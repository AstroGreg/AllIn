import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {
  private func initialPropsFromLaunchArguments() -> [AnyHashable: Any] {
    let args = ProcessInfo.processInfo.arguments
    let supportedKeys = Set([
      "e2eInitialRouteName",
      "e2eInitialRouteParams",
      "e2eAuthState",
    ])
    var props: [AnyHashable: Any] = [:]
    var index = 0
    while index < args.count {
      let token = args[index]
      guard token.hasPrefix("-") else {
        index += 1
        continue
      }
      let rawKey = String(token.dropFirst())
      guard supportedKeys.contains(rawKey), index + 1 < args.count else {
        index += 1
        continue
      }
      props[rawKey] = args[index + 1]
      index += 2
    }
    return props
  }

  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "SpotMe"
    self.dependencyProvider = RCTAppDependencyProvider()

    self.initialProps = initialPropsFromLaunchArguments()

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
