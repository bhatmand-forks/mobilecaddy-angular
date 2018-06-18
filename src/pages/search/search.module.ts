import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchPage } from './search';
import { MobileCaddyModule } from '../../../mobilecaddy-angular/src/lib.module';

@NgModule({
  declarations: [SearchPage],
  imports: [IonicPageModule.forChild(SearchPage), MobileCaddyModule.forRoot()]
})
export class SearchPageModule {}
