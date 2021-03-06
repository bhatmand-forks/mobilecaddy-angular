import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Content, IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { McConfigService } from '../../../mobilecaddy-angular/src/providers/mc-config/mc-config.service';
import { Subject } from 'rxjs/Subject';


@IonicPage()
@Component({
  selector: 'page-List1',
  templateUrl: 'List1.html',
})
export class List1 implements OnInit {
  private logTag: string = 'List1.ts';
  pageInfo:any;

  emConfig: any;
  config: any;
  listScrollHeight: string;
  title: string;
  listHeaderTitle: string;
  searchPlaceholder: string;
  displayFields: Array<any>;
  recs: Array<any> = [];
  filterList: Subject<boolean> = new Subject();
  showSearch: Boolean = false;
  isCardList = false;
  isImageCard = false;
  cardClass: String;
  itemClass: String;
  noDataMsg;
  noDataMsgClass;
  imagesStart;

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
          this.pageInfo = {"id":"a0n0X00000VJk0QQAT","order":1,"icon":"cog","name":"Products","component":"List1", "instanceId": "a0n0X00000VK9vdQAD"};
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
    this.setListScrollHeight();
  }

  setListScrollHeight() {
    // Guard against resize before view is rendered
    if (this.content) {
      this.listScrollHeight = (this.content.getContentDimensions().contentHeight - 10) + "px";
    }
  }


  filterRecs(ev: any) {
    this.filterList.next(ev);
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

    // TODO temp
    this.imagesStart = {field: "MC_File_Image_Path__c"};

    // Loop through stuff in the current "screen" conf for our module instance.
    this.config[this.pageInfo.component].forEach(comp => {
      try {
        let inflateResp = this.configService.inflateComponent(comp.name, comp);
        console.log("inflateResp", inflateResp);
        for ( let p in inflateResp ) {
          this[p] = inflateResp[p];
        }
      } catch (e) {
        console.warn(this.logTag, e, comp.name);
      }
    });
  }


  itemClicked(event) {
    console.log(this.logTag, "itemClicked", event);
    const targetPageType = this.config.List1[1].componentInterface.params.recordClicked;
    console.log(this.logTag, "targetPageType", targetPageType);
    this.navCtrl.push(
      targetPageType,
      {
        target: {
          component: targetPageType,
          instanceId : this.pageInfo.instanceId,
          parentType : this.pageInfo.parentType,
          recInfo : event
        }
      }
    );
  }
}
