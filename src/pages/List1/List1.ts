import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Content, IonicPage, NavParams } from 'ionic-angular';
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
          this.pageInfo = {"id":"a0n0X00000VJk0QQAT","order":1,"icon":"cog","name":"Products","component":"List1", "instanceId": "a0n0X00000VK9vdQAD"};
        }
        console.log("pageInfo", this.pageInfo);

        this.emConfig =  {"title": "Space Stuff","listHeaderTitle": "Things","displayFields" : [{"fields": ["Name"]}],"recs": [{"Id":"AAA111", "Name": "Shuttle X","Code__c" : "Super fast ship", "Custom_Rich_Text_2k_1__c": "Some nice description or something"},{"Id":"XXX999","Name": "SS 45","Code__c" : "Space Suit v45", "Custom_Rich_Text_2k_1__c": "Some nice description or something"}], "showSearch": true};
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

    // Get the config for our instanceID, from the 'Collection' attribute
    const allConf = this.configService.getConfig('Collection1');
    this.config = this.configService.getConfigById(allConf,this.pageInfo.instanceId).config;
    console.log(this.logTag, this.config);

    // TODO Gotta get some real data at some point, maybe here?
    this.recs = this.emConfig.recs;

    // Loop through stuff in the 'config.List1'
    this.config.List1.forEach(comp => {
      switch (comp.name) {
        case "Header1" :
          this.title = comp.config.transParams.Title;
          break;
        case "Item_List1" :
          this.inflateList1(comp);
          break;
        case "dataServiceInterface" :
          break;
        default :
          console.warn(this.logTag, "Unknown component.name", comp.name);
          break;
      }
    });
  }

  inflateList1(list1) {
    this.isCardList = list1.componentInterface.params.isCardList;
    this.isImageCard = list1.componentInterface.params.isImageCard;
    this.cardClass = list1.componentInterface.params.cardClass;
    this.itemClass = list1.componentInterface.params.itemClass;
    let displayFields = [];

    // Go through componentInterface children.
    list1.componentInterface.children.forEach(child => {

      // TODO Set list header
      // this.listHeaderTitle =

      // TODO List Order.

      // TODO Filter.

      // TODO Icons.

      // TODO Images.

      switch (child.name) {
        case "search":
          this.showSearch = true;
          this.searchPlaceholder = child.transParams.searchPlaceholder;
          break;
        case "row":
          let row = {
            classes: [],
            fields : [],
            tags : []
          };
          child.children.forEach(subChild => {
            switch ( subChild.name ) {
              // TODO "tag", "suffix", etc
              case "field" :
                row.fields.push(subChild.params.apiFieldName);
                row.classes.push(subChild.params.class);
                break;
              default:
                break;
            }
          });
          displayFields.push(row);
          break;
      }


    });
    console.log(this.logTag, "displayFields", displayFields);
    this.displayFields = displayFields;
    if ( this.recs.length === 0) {
      this.noDataMsg = list1.componentInterface.transParams.noDataMsg;
      this.noDataMsgClass = list1.componentInterface.params.noDataMsgClass;
    }
  }

  itemClicked(event) {
    console.log(this.logTag, "itemClicked", event);
    const targetPageType = this.config.List1[1].componentInterface.params.recordClicked;
    console.log(this.logTag, "targetPageType", targetPageType);
    // TODO Navigate to this page with correct 'target' info.
  }
}
