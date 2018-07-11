import { LoadingController, Loading } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class McLoadingProvider {
  constructor(public loadingCtrl: LoadingController) {}

  createLoading(msg?: string): Loading {
    let content = msg ? msg : 'Please wait...';
    let loader = this.loadingCtrl.create({
      content: content,
      duration: 120000
    });
    return loader;
  }
}
