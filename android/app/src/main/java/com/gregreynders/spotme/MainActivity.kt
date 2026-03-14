package com.gregreynders.spotme

import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    installSplashScreen()
    super.onCreate(null)
  }
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "SpotMe"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        override fun getLaunchOptions(): Bundle? {
          val extras = intent?.extras ?: return null
          val supportedKeys = setOf(
              "e2eInitialRouteName",
              "e2eInitialRouteParams",
              "e2eAuthState",
          )
          val launchOptions = Bundle()
          for (key in extras.keySet()) {
            if (!supportedKeys.contains(key)) continue
            val value = extras.get(key)
            when (value) {
              is String -> launchOptions.putString(key, value)
              is Boolean -> launchOptions.putBoolean(key, value)
              is Int -> launchOptions.putInt(key, value)
              is Double -> launchOptions.putDouble(key, value)
            }
          }
          return if (launchOptions.isEmpty) null else launchOptions
        }
      }
}
