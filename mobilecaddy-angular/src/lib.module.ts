import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

// Components
import { MobileCaddySyncIconComponent } from './mobilecaddy-sync-icon/mobilecaddy-sync-icon.component';
import { MobileCaddySyncComponent } from './mobilecaddy-sync/mobilecaddy-sync.component';
import { OutboxComponent } from './outbox/outbox.component';

// Providers
import { MobileCaddySyncService } from './mobilecaddy-sync-service/mobilecaddy-sync-service.service';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    MobileCaddySyncComponent,
    MobileCaddySyncIconComponent,
    OutboxComponent
  ],
  exports: [
    MobileCaddySyncComponent,
    MobileCaddySyncIconComponent,
    OutboxComponent
  ]
})
export class MobileCaddyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: MobileCaddyModule,
      providers: [MobileCaddySyncService]
    };
  }
}
