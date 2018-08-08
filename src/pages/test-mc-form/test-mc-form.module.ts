import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestMcFormPage } from './test-mc-form';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [
    TestMcFormPage,
  ],
  imports: [
    IonicPageModule.forChild(TestMcFormPage),
    MobileCaddyModule
  ],
})
export class TestMcFormPageModule {}
