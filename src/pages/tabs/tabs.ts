import { Component } from '@angular/core';
import { ShareProvider } from '../../providers/share/share';
import { IonicPage } from 'ionic-angular';

@IonicPage({
  priority: 'low'
})
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'HomePage';
  tab2Root = 'DetailsPage';
  tab3Root = 'PretripPage';
  tab4Root = 'ExaminationPage';
  tab5Root = 'IntersectionsPage';

  sharedData: ShareProvider;

  constructor(shareProvider: ShareProvider) {
    this.sharedData = shareProvider;
  }
}
