import { Component } from '@angular/core';
import { ShareProvider } from '../../providers/share/share';
import { IonicPage } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

@IonicPage({
  priority: 'high'
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

  constructor(shareProvider: ShareProvider, public screenOrientation: ScreenOrientation) {
    this.sharedData = shareProvider;
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }
}
