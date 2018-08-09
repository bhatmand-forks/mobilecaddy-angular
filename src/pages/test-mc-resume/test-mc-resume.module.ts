import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestMcResumePage } from './test-mc-resume';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [
    TestMcResumePage,
  ],
  imports: [
    IonicPageModule.forChild(TestMcResumePage),
    MobileCaddyModule
  ],
})
export class TestMcResumePageModule {}
