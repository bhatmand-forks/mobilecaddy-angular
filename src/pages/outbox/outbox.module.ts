import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OutboxPage } from './outbox';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [OutboxPage],
  imports: [IonicPageModule.forChild(OutboxPage), MobileCaddyModule.forRoot()]
})
export class OutboxPageModule {}
