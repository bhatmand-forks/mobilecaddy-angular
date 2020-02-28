import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Content, IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { McConfigService } from '../../../mobilecaddy-angular/src/providers/mc-config/mc-config.service';


@IonicPage()
@Component({
  selector: 'page-Tree1',
  templateUrl: 'Tree1.html',
})
export class Tree1 implements OnInit {
  private logTag: string = 'Tree1.ts';
  pageInfo:any;

  config: any;
  tree: any;
  recs: Array<any>;
  rec: any;

  // TODO move search into mc-tree?
  searchTerm: string = '';
  items: Array<any>;
  paddingLeft: string;
  searchSelectedItem: any;


  @ViewChild(Content) content: Content;

  constructor(
      private navCtrl: NavController,
      public navParams: NavParams,
      public translate: TranslateService,
      private ref: ChangeDetectorRef,
      private configService: McConfigService,
      )
      {
        this.pageInfo = navParams.get('target');
        // Set dummy conf for development - useful if we load straight into this page
        if (! this.pageInfo) {
          this.pageInfo = {"id":"a0n0X00000VJk0QQAT","order":1,"icon":"cog","name":"Products","component":"Tree1", "instanceId": "a0n0X00000W24leQAB", recInfo :{
            "Id": "a0k0X00000dvGWVQA2",
            "Manual_Name__c": "JM new book",
            "image": {
              "changingThisBreaksApplicationSecurity": "/mock/files/undefined"
            }
          }};
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

    // Get the config for our instanceID, from the Module type
    let parentType;
    if (this.pageInfo.parentType) {
      // Most likely scenario
      parentType = this.pageInfo.parentType;
    } else {
      // Running in Studio Emulator
      let tmpAllConf = this.configService.getConfig();
      parentType = this.configService.getConfigById(tmpAllConf, this.pageInfo.instanceId).parentType;
    }
    const allConf = this.configService.getConfig(parentType);
    this.config = this.configService.getConfigById(allConf,this.pageInfo.instanceId).config;
    console.log(this.logTag, this.config);

    // TODO How do I really get the object API name
    // const apiObjectName = this.config.Data1[0].groups[0].config.apiObjectName;
    // const recs = localStorage.getItem("apiObjectName");
    let recs = localStorage.getItem(this.pageInfo.instanceId +"-" + this.pageInfo.component);

    this.recs = (recs) ? JSON.parse(recs) : [];

    // Loop through stuff in the current "screen" conf for our module instance.
    this.config[this.pageInfo.component].forEach(comp => {
      try {
        let rec = (comp.name === "Tree1") ? this.getRecord() :{};
        let inflateResp = this.configService.inflateComponent(comp.name, comp, [rec]);
        console.log("inflateResp", inflateResp);
        for ( let p in inflateResp ) {
          this[p] = inflateResp[p];
        }
      } catch (e) {
        console.warn(this.logTag, e, comp.name);
      }
    });
  }

  getRecord() {
    return this.recs.find( ({ Id }) => Id === this.pageInfo.recInfo.Id );
  }

  itemClicked(event) {
    console.log(this.logTag, "itemClicked", event);
    const targetPageType = this.config[this.pageInfo.component][1].componentInterface.params.recordClicked;
    console.log(this.logTag, "targetPageType", targetPageType);
    this.navCtrl.push(
      targetPageType,
      {
        target: {
          component: targetPageType,
          instanceId : this.pageInfo.instanceId,
          recInfo : event
        }
      }
    );
  }
}
