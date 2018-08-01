import { Component } from '@angular/core';

import { DetailsPage } from '../details/details';
import { ExaminationPage } from '../examination/examination';
import { HomePage } from '../home/home';
import { ShareProvider } from '../../providers/share/share';
import { IntersectionsPage } from '../intersections/intersections';
import { PretripPage } from '../pretrip/pretrip';
import { IonicPage } from 'ionic-angular';

@IonicPage()
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
