import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { MobileCaddySyncIconComponent } from './mobilecaddy-sync-icon/mobilecaddy-sync-icon.component';
import { MobileCaddySyncComponent } from './mobilecaddy-sync/mobilecaddy-sync.component';
import { MobileCaddySyncService } from './mobilecaddy-sync-service/mobilecaddy-sync-service.service';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [MobileCaddySyncComponent, MobileCaddySyncIconComponent],
  exports: [MobileCaddySyncComponent, MobileCaddySyncIconComponent]
})
export class MobileCaddyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: MobileCaddyModule,
      providers: [MobileCaddySyncService]
    };
  }
}
