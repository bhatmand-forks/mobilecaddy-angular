import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Detail1 } from './Detail1';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    Detail1,
  ],
  imports: [
    IonicPageModule.forChild(Detail1),
    TranslateModule.forChild(),
    MobileCaddyModule
  ],
})
export class Detail1PageModule {}
