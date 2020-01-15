import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { List1 } from './List1';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    List1,
  ],
  imports: [
    IonicPageModule.forChild(List1),
    TranslateModule.forChild(),
    MobileCaddyModule
  ],
})
export class List1PageModule {}
