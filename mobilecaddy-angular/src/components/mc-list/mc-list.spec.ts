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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(comp).toBeTruthy();
    });

    // it('should have not have ion-list-header if headerTitle undefined', () => {
    //     const bannerElement: HTMLElement = fixture.nativeElement;
    //     const p = bannerElement.querySelector('ion-list-header');
    //     expect(p).toBe(null);
    // });

    it('should have ion-list-header with "Hello', () => {
        const headerTitle = 'HEADER TITLE';
        comp.headerTitle = headerTitle;
        const bannerElement: HTMLElement = fixture.nativeElement;
        const p = bannerElement.querySelector('ion-list-header');
        expect(p.textContent).toEqual(headerTitle);
    });

    it('should have a clickAdd()', () => {
        spyOn(comp.addClicked, 'emit');
        comp.clickAdd();
        expect(comp.addClicked.emit).toHaveBeenCalled();
    });

});
