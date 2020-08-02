package com.krea8iv.soundkit;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.magus.fblogin.FacebookLoginPackage;
import com.sbugert.rnadmob.RNAdMobPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.toast.RCTToastPackage;
import com.guichaguri.trackplayer.TrackPlayer;
import io.realm.react.RealmReactPackage;
import com.rnfs.RNFSPackage;
import com.tanguyantoine.react.MusicControl;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import android.support.multidex.MultiDex;
import android.content.Context;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new FacebookLoginPackage(),
            new RNAdMobPackage(),
            new RNScreensPackage(),
            new ReactNativeRestartPackage(),
            new RCTToastPackage(),
            new TrackPlayer(),
            new RealmReactPackage(),
            new RNFSPackage(),
            new MusicControl(),
            new RNGestureHandlerPackage(),
            new ReactNativeLocalizationPackage(),
            new SplashScreenReactPackage(),
            new PickerPackage(),
            new RNSoundPackage(),
            new RNI18nPackage(),
            new FastImageViewPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }

  @Override
      protected void attachBaseContext(Context base) {
          super.attachBaseContext(base);
          MultiDex.install(this);
      }
}
