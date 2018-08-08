import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompletedFormsPage } from './completed-forms';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [
    CompletedFormsPage,
  ],
  imports: [
    IonicPageModule.forChild(CompletedFormsPage),
    MobileCaddyModule
  ],
})
export class CompletedFormsPageModule {}
