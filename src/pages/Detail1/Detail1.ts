import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Content, IonicPage, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { McConfigService } from '../../../mobilecaddy-angular/src/providers/mc-config/mc-config.service';


@IonicPage()
@Component({
  selector: 'page-Detail1',
  templateUrl: 'Detail1.html',
})
export class Detail1 implements OnInit {
  private logTag: string = 'Detail1.ts';
  pageInfo:any;

  emConfig: any;
  config: any;

  rec: any;
  title: string;


  @ViewChild(Content) content: Content;

  constructor(
      public navParams: NavParams,
      public translate: TranslateService,
      private ref: ChangeDetectorRef,
      private configService: McConfigService,
      )
      {
        this.pageInfo = navParams.get('target');
        // Set dummy conf for development - useful if we load straight into this page
        if (! this.pageInfo) {
          this.pageInfo = {
            "instanceId": "a0n0X00000VK9vdQAD",
            "parentType" : "Collection1",
            "recInfo": {
              "Id": "AAA111",
              "Name": "MR12-50-S",
              "Code__c": "code__c",
              "Custom_Rich_Text_2k_1__c": "MR12-50-S Rover",
              "MC_File_Image_Path__c": "0680X00000CoGBPQA3.jpg",
              "image": {
                "changingThisBreaksApplicationSecurity": "/mock/files/0680X00000CoGBPQA3.jpg"
              }
            }
          };
        }
        console.log("pageInfo", this.pageInfo);

  }

  ngOnInit() {
    console.log(this.logTag);
  }

  ionViewDidEnter() {
    console.log(this.logTag, 'ionViewDidEnter');
    this.applyConfig();
    this.ref.detectChanges();
  }

  applyConfig() {
    // Get the config for our instanceID, from the 'Collection' attribute
    const allConf = this.configService.getConfig(this.pageInfo.parentType);
    this.config = this.configService.getConfigById(allConf,this.pageInfo.instanceId).config;
    console.log(this.logTag, this.config);

    // this.rec = (rec) ? JSON.parse(rec) : [];
    this.rec = this.pageInfo.recInfo;

    // TODO temp
    // this.imagesStart = {field: "MC_File_Image_Path__c"};

    // Loop through stuff in the current "screen" conf for our module instance.
    this.config[this.pageInfo.component].forEach(comp => {
      try {
        let inflateResp = this.configService.inflateComponent(comp.name, comp, [this.rec]);
        console.log("inflateResp", inflateResp);
        for ( let p in inflateResp ) {
          this[p] = inflateResp[p];
        }
      } catch (e) {
        console.warn(this.logTag, e, comp.name);
      }
    });
  }

}
