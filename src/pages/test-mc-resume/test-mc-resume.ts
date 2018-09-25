import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { McResumeProvider } from '../../../mobilecaddy-angular/src/providers/mc-resume/mc-resume';
import { Subscription } from 'rxjs/Subscription';
import { McLockScreenComponent } from '../../../mobilecaddy-angular/src/components/mc-lock-screen/mc-lock-screen'
import { McConfigService } from '../../../mobilecaddy-angular/src/providers/mc-config/mc-config.service';
import { McLockScreenProvider } from '../../../mobilecaddy-angular/src/providers/mc-lock-screen/mc-lock-screen';

@IonicPage()
@Component({
  selector: 'page-test-mc-resume',
  templateUrl: 'test-mc-resume.html',
})
export class TestMcResumePage implements OnDestroy {

  readonly logTag: string = 'test-mc-resume.ts';
  // So we can unsubscribe subscriptions on destroy
  private onResumeSubscription: Subscription;
  private onNavigationSubscription: Subscription;
  private onColdStartSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public mcResumeProvider: McResumeProvider,
    public mcConfig: McConfigService,
    private mcLockScreenProvider: McLockScreenProvider
  ) {
  }

  ngOnDestroy() {
    if (this.onNavigationSubscription) {
      this.onNavigationSubscription.unsubscribe();
    }
    if (this.onResumeSubscription) {
      this.onResumeSubscription.unsubscribe();
    }
    if (this.onColdStartSubscription) {
      this.onColdStartSubscription.unsubscribe();
    }
  }

  pause() {
    console.log('pause');
    this.mcResumeProvider.setPauseTime(Date.now());
  }

  resume(type: string) {
    // Get active page
    let activeNav = this.navCtrl.getActive();
    // console.log('resume activeNav.instance.logTag',activeNav.instance.logTag);

    // The onResume options are taken from app.config.ts.
    // We need to change those options to fit with our call to 'this.mcResumeProvider.onResume' below.
    // We will run a sync point ('mySync') - this is also configured in the app.config.ts

    let config = this.mcConfig.getConfig();
    config.onResume = {
      checkPausePeriod: false,
      maxPausePeriod: 0,
      presentLockScreen: false,
      pages: [
        {
          id: 'test-mc-resume.ts',
          syncPoint: 'mySync',
          showSyncLoader: true,
          allowUpgrade: true
        }
      ]
    };

    if (type == 'lock') {
      config.onResume.presentLockScreen = true;
      // Update the config for 'onResume' so call works as we want
      this.mcConfig.setConfig(config);

      // We need to make sure there's a pin code stored (so we can unlock screen)
      this.mcLockScreenProvider.getCode().then(code => {
        if (code) {
          // Imitate app 'on resume'.
          // This code would normally appear in the 'this.platform.resume' event subscription.
          this.onResumeSubscription = this.mcResumeProvider.onResume(activeNav.instance.logTag, McLockScreenComponent).subscribe(res => {
            console.log('mcResumeProvider.onResume res', res);
          });
        } else {
          // No stored pin so ask user to set one
          this.mcLockScreenProvider.setupLockScreenCode().then(res => {
            if (res) {
              // Imitate app 'on resume'.
              // This code would normally appear in the 'this.platform.resume' event subscription.
              this.onResumeSubscription = this.mcResumeProvider.onResume(activeNav.instance.logTag, McLockScreenComponent).subscribe(res => {
                console.log('mcResumeProvider.onResume res', res);
              });
            }
          });
        }
      });
    } else {
      // No lock screen to present.
      // Update the config for 'onResume' so call works as we want
      this.mcConfig.setConfig(config);

      // Imitate app 'on resume'.
      // This code would normally appear in the 'this.platform.resume' event subscription.
      this.onResumeSubscription = this.mcResumeProvider.onResume(activeNav.instance.logTag, McLockScreenComponent).subscribe(res => {
        console.log('mcResumeProvider.onResume res', res);
      });
    }
  }

  navigation() {
    // Get active page
    let activeNav = this.navCtrl.getActive();
    // console.log('resume activeNav.instance.logTag',activeNav.instance.logTag);

    // The onNavigation options are taken from app.config.ts.
    // We need to change those options to fit with our call to 'this.mcResumeProvider.onNavigation' below.
    // We will run a sync point ('mySync') - this is also configured in the app.config.ts

    let config = this.mcConfig.getConfig();
    console.log('#################config',config);
    config.onNavigation = {
      checkPausePeriod: false,
      maxPausePeriod: 0,
      presentLockScreen: false,
      pages: [
        {
          id: 'test-mc-resume.ts',
          syncPoint: 'mySync',
          showSyncLoader: true,
          allowUpgrade: true
        }
      ]
    };

    // Update the config for 'onNavigation' so call works as we want
    this.mcConfig.setConfig(config);

    // Imitate app 'on resume'.
    this.onNavigationSubscription = this.mcResumeProvider.onNavigation(activeNav.instance.logTag).subscribe(res => {
      console.log('mcResumeProvider.onNavigation res', res);
    });
  }

  coldstart(type: string) {
    // The onColdStart options are taken from app.config.ts.
    // We need to change those options to fit with our call to 'this.mcResumeProvider.onColdStart' below.

    let config = this.mcConfig.getConfig();
    config.onColdStart = {
      checkPausePeriod: true,
      maxPausePeriod: 0,
      presentLockScreen: false,
      showSyncLoader: false,
      showBuildMsgs: false
    };

    if (type == 'lock') {
      // Update option to force lock screen presentation
      config.onColdStart.presentLockScreen = true;
      // Update the config for 'onColdStart' so call works as we want
      this.mcConfig.setConfig(config);

      // We need to make sure there's a pin code stored (so we can unlock screen)
      this.mcLockScreenProvider.getCode().then(code => {
        if (code) {
          // Imitate app 'on cold start'.
          // This code would normally appear in the first page of app
          this.onColdStartSubscription = this.mcResumeProvider.onColdStart(McLockScreenComponent).subscribe(res => {
            console.log('mcResumeProvider.onColdStart res', res);
          });
        } else {
          // No stored pin so ask user to set one
          this.mcLockScreenProvider.setupLockScreenCode().then(res => {
            if (res) {
              // Imitate app 'on cold start'.
              // This code would normally appear in the first page of app
              this.onColdStartSubscription = this.mcResumeProvider.onColdStart(McLockScreenComponent).subscribe(res => {
                console.log('mcResumeProvider.onColdStart res', res);
              });
            }
          });
        }
      });
    } else {
      // No lock screen to present.
      // Update the config for 'onColdStart' so call works as we want
      this.mcConfig.setConfig(config);

      // Imitate app 'on resume'.
      // This code would normally appear in the 'this.platform.resume' event subscription.
      this.onColdStartSubscription = this.mcResumeProvider.onColdStart().subscribe(res => {
        console.log('mcResumeProvider.onColdStart res', res);
      });
    }
  }

}
