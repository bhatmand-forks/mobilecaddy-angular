import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture,  inject, TestBed } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';

import { DomSanitizer } from '@angular/platform-browser';
import { McDataProvider } from '../../providers/mc-data/mc-data';
import { LoadingController } from 'ionic-angular';

import { McListComponent } from './mc-list';

describe('McListComponent', () => {
    let comp: McListComponent;
    let fixture: ComponentFixture<McListComponent>;

    beforeEach(async() => {
        const dataServiceStub = {};

        const domSanitizerStub = {
            sanitize: () => {
                // console.log("sanitising");
                return {};
            }
        };

        TestBed.configureTestingModule({
        // provide the component-under-test and dependent service
            declarations: [McListComponent],
            providers: [
                { provide: LoadingController, useValue: LoadingController },
                { provide: McDataProvider, useValue: dataServiceStub},
                { provide: DomSanitizer, useValue: domSanitizerStub},
            ],
            imports: [IonicModule.forRoot({})]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(McListComponent);
        comp    = fixture.componentInstance;
        // comp.headerTitle = "headerTitle";
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(comp).toBeTruthy();
    });


    // ion-list-header
    it('should have not have ion-list-header if headerTitle undefined', () => {
        const fixtureEl: HTMLElement = fixture.nativeElement;
        const p = fixtureEl.querySelector('ion-list-header');
        expect(p).toBe(null);
    });

    it('should have ion-list-header with "HEADER TITLE', () => {
        const headerTitle = 'HEADER TITLE';
        comp.headerTitle = headerTitle;
        fixture.detectChanges();
        const fixtureEl: HTMLElement = fixture.nativeElement;
        const p = fixtureEl.querySelector('ion-list-header');
        expect(p.textContent).toContain(headerTitle);
    });


    // ion-searchbar
    it('should have not have ion-list-header if showSearch undefined', () => {
        const fixtureEl: HTMLElement = fixture.nativeElement;
        const p = fixtureEl.querySelector('ion-searchbar');
        expect(p).toBe(null);
    });

    it('should have ion-searchbar with showSearch == true', () => {
        comp.showSearch = true;
        fixture.detectChanges();
        const fixtureEl: HTMLElement = fixture.nativeElement;
        const p = fixtureEl.querySelector('ion-searchbar');
        expect(p.textContent).toBe("Cancel");
    });


    // clickAdd
    it('should have a clickAdd()', () => {
        spyOn(comp.addClicked, 'emit');
        comp.clickAdd();
        expect(comp.addClicked.emit).toHaveBeenCalled();
    });


    // noDataMsg
    it('should show noDataMsg when recs==[]', () => {
        comp.noDataMsg = "NO_DATA";
        comp.noDataMsgClass = "NO-DATA-CLASS";
        comp.recs = [];
        fixture.detectChanges();
        const fixtureEl: HTMLElement = fixture.nativeElement;
        const p = fixtureEl.querySelector('.NO-DATA-CLASS');
        expect(p.textContent).toBe("NO_DATA");
    });

    it('should NOT show noDataMsg when recs==["a"]', () => {
        comp.noDataMsg = "NO_DATA";
        comp.noDataMsgClass = "NO-DATA-CLASS";
        comp.recs = ["a"];
        fixture.detectChanges();
        const fixtureEl: HTMLElement = fixture.nativeElement;
        const p = fixtureEl.querySelector('.NO-DATA-CLASS');
        expect(p).toBeNull();
    });


    // wrapField
    it('should wrapField with no tags/classes', () => {
        comp.displayFields = [
            {fields: ['Id']}
        ]
        fixture.detectChanges();
        let r = comp.wrapField(0,0, 'Id1');
        expect(r).toBe('Id1');
    });

    it('should wrapField with empty tags/classes', () => {
        comp.displayFields = [
            {fields: ['Id'], tags: [], classes: []}
        ]
        fixture.detectChanges();
        let r = comp.wrapField(0,0, 'Id1');
        expect(r).toBe('Id1');
    });

    it('should wrapField with no tags, 2 classes', () => {
        comp.displayFields = [
            {fields: ['Id'], classes:['c1 c2']}
        ]
        fixture.detectChanges();
        let r = comp.wrapField(0,0, 'Id1');
        expect(r).toBe('<span class="c1 c2">Id1<span/>');
    });

    it('should wrapField with tag, 1 classes', () => {
        comp.displayFields = [
            {fields: ['Id'], tags: ['p'], classes:['c1']}
        ]
        fixture.detectChanges();
        let r = comp.wrapField(0,0, 'Id1');
        expect(r).toBe('<p class="c1">Id1<p/>');
    });

    // TODO COMPLETE - Not sure why but I'm only seeing [object Object] when looking inside the mc-row
    it('should show list when recs populated with tags and classes', () => {
        // Set up recs etc
        comp.recs = [{"Id":"Id1","Name":"MR12-50-S","Code__c":"Code1","Custom_Rich_Text_2k_1__c":"MR12-50-S Rover","MC_File_Image_Path__c":"0680X00000CoGBPQA3.jpg"},{"Id":"Id2","Name":"MR12-50-S","Code__c":"Code2","Custom_Rich_Text_2k_1__c":"Standard Rover","MC_File_Image_Path__c":"0680X00000CowMvQAJ.jpg"}];
        comp.displayFields = [
            {fields: ['Id'],tags: ['h2'], classes: ['recHeaderClass']},
            {fields: ['Code__c']}
        ];
        fixture.detectChanges();

        const fixtureEl: HTMLElement = fixture.nativeElement;
        const ionItems = fixtureEl.querySelectorAll('.mc-row');
        expect(ionItems.length).toBe(4);
    });
});
