import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';
import { CommercialDbProvider } from '../../providers/commercial-db/commercial-db';

/**
 * Generated class for the PretripPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  priority: 'off'
})
@Component({
  selector: 'page-pretrip20',
  templateUrl: 'pretrip20.html',
})
export class Pretrip20Page {

  preTripThreshold = 9;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public sharedData: ShareProvider,
    public dbProvider: CommercialDbProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Pretrip20Page');
  }

  saveCurrentExam() {
    if (this.sharedData.prepareCurrentExam().valid) {
      this.dbProvider.updateExam();
    }
  }

  getPretripDemerits() {
    
    let keys = Object.keys(this.sharedData.code20Pretest);
    let uncheckedCount = 0;

    for (let keyIdx=1; keyIdx < keys.length; keyIdx++) {
      uncheckedCount += this.sharedData.code20Pretest[keys[keyIdx]] == false ? 1 : 0;
    }

    return uncheckedCount;
  }
}
