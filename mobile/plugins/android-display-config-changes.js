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
    // Far-view displays (car casts like Tesor report ~240dpi on a large canvas)
    // render dp-sized UI too small to read. Scaling the density itself — rather
    // than a JS-side view transform — keeps every RN consumer (screens, modals,
    // insets, IME) consistent: screens laid out at raw window size pushed
    // bottom-anchored UI (command dock) off the visible area.
    var scaled = false
    if (window.densityDpi < FAR_VIEW_MAX_DPI) {
      val factor = FAR_VIEW_TARGET_DPI.toFloat() / window.densityDpi
      for (m in listOf(window, screen)) {
        m.scaledDensity = m.scaledDensity * factor
        m.density = FAR_VIEW_TARGET_DPI / 160f
        m.densityDpi = FAR_VIEW_TARGET_DPI
      }
      scaled = true
    }
    Log.i(
      "OrcaDisplay",
      "$why displayId=\${display?.displayId} scaled=\$scaled " +
        "window=\${window.widthPixels}x\${window.heightPixels}@\${window.densityDpi}dpi " +
        "screen=\${screen.widthPixels}x\${screen.heightPixels}@\${screen.densityDpi}dpi"
    )
  }

  companion object {
    // DisplayMetricsHolder dpi below this is treated as a far-view display and
    // upscaled to FAR_VIEW_TARGET_DPI (matches display-scale.ts FAR_VIEW_*).
    private const val FAR_VIEW_MAX_DPI = 256
    private const val FAR_VIEW_TARGET_DPI = 384
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
