import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Content, IonicPage, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';


@IonicPage()
@Component({
  selector: 'page-List1',
  templateUrl: 'List1.html',
})
export class List1 implements OnInit {
  private logTag: string = 'List1.ts';
  pageInfo:any;

  headerStr:string;

  emConfig: any;
  listScrollHeight: string;
  title: string;
  listHeaderTitle: string;
  displayFields: Array<any>;
  recs: Array<any>;
  filterList: Subject<boolean> = new Subject();
  showSearch: Boolean = false;

  @ViewChild(Content) content: Content;

  constructor(
      public navParams: NavParams,
      public translate: TranslateService,
      private ref: ChangeDetectorRef,
      )
      {
        this.pageInfo = navParams.get('target');
        // Set dummy conf for development - useful if we load straight into this page
        if (! this.pageInfo) {
          this.pageInfo = {"id":"a0n0X00000VJk0QQAT","translationKey":"a0n0X00000VJk0QQAT.Name","order":1,"icon":"cog","name":"Products","component":"List1"};
        }
        console.log("pageInfo", this.pageInfo);
        this.headerStr = this.pageInfo.translationKey;
        this.emConfig =  {"title": "Space Stuff","listHeaderTitle": "Things","displayFields" : [{"fields": ["Name"]}],"recs": [{"Name": "Shuttle X","Description" : "Super fast ship"},{"Name": "SS 45","Description" : "Space Suit v45"}], "showSearch": true};
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
    this.title = this.emConfig.title;
    this.listHeaderTitle = this.emConfig.listHeaderTitle;
    this.title = this.emConfig.title;
    this.displayFields = this.emConfig.displayFields;
    this.showSearch = this.emConfig.showSearch;
    this.recs = this.emConfig.recs;
  }
}
