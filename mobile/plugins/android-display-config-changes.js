const { withAndroidManifest, withMainActivity, AndroidConfig } = require('expo/config-plugins')

// Why: Expo's default configChanges omit density/fontScale, so moving between
// displays of different density (phone -> cast/virtual display such as Tesor)
// recreates the activity and restarts the JS context — dropping every live
// terminal/chat stream. Handling them in-process keeps sessions alive.
const EXTRA_CONFIG_CHANGES = ['density', 'fontScale', 'fontWeightAdjustment']

// Why: ReactRootView seeds DisplayMetricsHolder from applicationContext, which
// tracks the default (phone) display. On a secondary display (car head-unit
// casts like Tesor, DeX windows) that gives phone metrics — the app lays out a
// narrow phone column into the wide canvas and text renders too small to read.
// Rebinding the holder to the activity's own display fixes sizing.
const IMPORTS_ANCHOR = 'import android.os.Bundle\n'
const IMPORTS_ADD =
  'import android.content.res.Configuration\n' +
  'import android.util.Log\n' +
  'import com.facebook.react.uimanager.DisplayMetricsHolder\n'
const ONCREATE_ANCHOR = 'super.onCreate(null)'
const ONCREATE_ADD = `

    rebindDisplayMetrics("onCreate")`
const LIFECYCLE_BLOCK = `

  // RN seeds DisplayMetricsHolder from applicationContext (default display
  // metrics). On secondary displays (car casts like Tesor, DeX) that yields
  // phone metrics — the app lays out a shrunken phone column. Rebind to this
  // activity's display and log both sides so repro dumps show what changed.
  private fun rebindDisplayMetrics(why: String) {
    DisplayMetricsHolder.initDisplayMetrics(this)
    val window = DisplayMetricsHolder.getWindowDisplayMetrics()
    val screen = DisplayMetricsHolder.getScreenDisplayMetrics()
    Log.i(
      "OrcaDisplay",
      "$why displayId=\${display?.displayId} " +
        "window=\${window.widthPixels}x\${window.heightPixels}@\${window.densityDpi}dpi " +
        "screen=\${screen.widthPixels}x\${screen.heightPixels}@\${screen.densityDpi}dpi"
    )
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    // RN re-seeds the holder from the React (application) context inside the
    // super call — rebind AFTER it so downstream emissions/draws see this
    // display's metrics.
    rebindDisplayMetrics("onConfigurationChanged")
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    // Surface start can construct ReactRootView after onCreate and re-seed the
    // holder with application metrics; focus is the last lifecycle point before
    // the first frame.
    if (hasFocus) {
      rebindDisplayMetrics("onWindowFocusChanged")
    }
  }
`

function withMainActivityDisplayMetrics(config) {
  return withMainActivity(config, (cfg) => {
    if (cfg.modResults.language !== 'kt') {
      return cfg
    }
    let contents = cfg.modResults.contents
    if (contents.includes('rebindDisplayMetrics')) {
      return cfg
    }
    if (!contents.includes(IMPORTS_ANCHOR) || !contents.includes(ONCREATE_ANCHOR)) {
      throw new Error(
        'MainActivity.kt structure changed — update android-display-config-changes plugin'
      )
    }
    contents = contents.replace(IMPORTS_ANCHOR, IMPORTS_ANCHOR + IMPORTS_ADD)
    contents = contents.replace(ONCREATE_ANCHOR, ONCREATE_ANCHOR + ONCREATE_ADD)
    // onConfigurationChanged goes on the class body — append before last '}'
    const lastBrace = contents.lastIndexOf('}')
    contents = contents.slice(0, lastBrace) + LIFECYCLE_BLOCK + '}\n'
    cfg.modResults.contents = contents
    return cfg
  })
}

module.exports = function withAndroidDisplayConfigChanges(config) {
  config = withAndroidManifest(config, (cfg) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults)
    const current = (activity.$['android:configChanges'] ?? '').split('|').filter(Boolean)
    const merged = [...new Set([...current, ...EXTRA_CONFIG_CHANGES])].join('|')
    activity.$['android:configChanges'] = merged
    return cfg
  })
  return withMainActivityDisplayMetrics(config)
}
