import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Tree1 } from './Tree1';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    Tree1,
  ],
  imports: [
    IonicPageModule.forChild(Tree1),
    TranslateModule.forChild(),
    MobileCaddyModule
  ],
})
export class Tree1PageModule {}
