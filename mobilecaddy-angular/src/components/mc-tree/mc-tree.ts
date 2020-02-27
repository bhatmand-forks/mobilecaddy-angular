import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { ManualItemProvider } from '../../providers/manual-item/manual-item';

@Component({
  selector: 'mc-tree',
  templateUrl: 'mc-tree.html'
})
export class McTreeComponent {

  private logTag: string = 'mc-tree.ts';
  searchTerm: string = '';

  @Input('items') items: Array<Object>;
  @Input('paddingLeft') paddingLeft: string = '0px';
  @Input('searchSelectedItem') searchSelectedItem: any;
  @Input('searchPlaceholder') searchPlaceholder: string = 'Search';
  @Input('showSearch') showSearch: boolean;


  private filteredItems: Array<Object>;

  constructor(
    private navCtrl: NavController,
    // private manualItemProvider: ManualItemProvider
  ) { }

  itemSelected(item: any, event: any) {
    console.log(this.logTag, "itemSelected");

    event.stopPropagation();
    // console.log('itemSelected', item);
    // Remove highlighting from any previously selected item
    if (this.searchSelectedItem) {
      this.searchSelectedItem.classList.remove('selected-item');
    }
    if (item.type === 'section' && item.items.length > 0) {
      // For section, toggle expand/collapse
      item.expanded = !item.expanded;
      // Collapse any children sections
      this.collapseTree(item.items);
    }
    if (item.type !== 'section') {
      // TODO Re-add back in - currently in cust-service-client
      // this.manualItemProvider.showPage(this.navCtrl, item);
    }
  }

  collapseTree(items: any) {
    for (let i = 0; i < items.length; i++) {
      items[i].expanded = false;
      if (items[i].items.length > 0) {
        this.collapseTree(items[i].items);
      }
    }
  }

  filterItems(ev: any) {
    this.searchTerm = (ev.target.value) ? ev.target.value : '';
    console.log(this.logTag, "filterItems", this.searchTerm);

    this.filteredItems = [];
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      // Recursively get matching items from the tree
      this.getMatchingItems(null, this.items)
    }
  }

  private getMatchingItems(parent: any, items: any) {
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].label.toLowerCase().includes(this.searchTerm.toLowerCase())) {
          // Also, add a 'parent' item so we can expand items down to any selected section
          items[i].parent = parent;
          // Save the item for the search results
          this.filteredItems.push(items[i]);
        }
        if (items[i].items.length > 0) {
          this.getMatchingItems(items[i], items[i].items);
        }
      }
    }
  }

}
