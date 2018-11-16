import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestMcListImagePage } from './test-mc-list-image';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [
    TestMcListImagePage,
  ],
  imports: [
    IonicPageModule.forChild(TestMcListImagePage),
    MobileCaddyModule
  ],
})
export class TestMcListImagePageModule {}
