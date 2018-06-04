import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountDetailPage } from './accountDetail';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [AccountDetailPage],
  imports: [
    IonicPageModule.forChild(AccountDetailPage),
    MobileCaddyModule.forRoot()
  ]
})
export class AccountDetailPageModule {}
