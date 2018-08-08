import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestMcListPage } from './test-mc-list';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [
    TestMcListPage,
  ],
  imports: [
    IonicPageModule.forChild(TestMcListPage),
    MobileCaddyModule
  ],
})
export class TestMcListPageModule {}
