import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestMcLockScreenPage } from './test-mc-lock-screen';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [
    TestMcLockScreenPage,
  ],
  imports: [
    IonicPageModule.forChild(TestMcLockScreenPage),
    MobileCaddyModule
  ],
})
export class TestMcLockScreenPageModule {}
