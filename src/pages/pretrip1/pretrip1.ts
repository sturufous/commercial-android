import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
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
  selector: 'page-pretrip1',
  templateUrl: 'pretrip1.html',
})
export class Pretrip1Page {

  preTripThreshold = 8;
  airBrakeThreshold = 3;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public sharedData: ShareProvider,
    public dbProvider: CommercialDbProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Pretrip1Page');
  }

  saveCurrentExam() {
    if (this.sharedData.prepareCurrentExam().valid) {
      this.dbProvider.updateExam();
    }
  }

  getPretripDemerits() {
    
    let keys = Object.keys(this.sharedData.class1Pretest);
    let uncheckedCount = 0;

    for (let keyIdx=1; keyIdx < keys.length; keyIdx++) {
      uncheckedCount += this.sharedData.class1Pretest[keys[keyIdx]] == false ? 1 : 0;
    }

    return uncheckedCount;
  }

  getAirBrakeDemerits() {
    
    let keys = Object.keys(this.sharedData.class1Pretest.airBrake);
    let uncheckedCount = 0;

    for (let keyIdx=0; keyIdx < keys.length; keyIdx++) {
      uncheckedCount += this.sharedData.class1Pretest.airBrake[keys[keyIdx]] == false ? 1 : 0;
    }

    return uncheckedCount;
  }
}
