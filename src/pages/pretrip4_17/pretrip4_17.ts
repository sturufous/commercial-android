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
  selector: 'page-pretrip417',
  templateUrl: 'pretrip4_17.html',
})
export class Pretrip4_17Page {

  preTripThreshold = 7;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public sharedData: ShareProvider,
    public dbProvider: CommercialDbProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Pretrip4_17Page');
  }

  saveCurrentExam() {
    if (this.sharedData.prepareCurrentExam().valid) {
      this.dbProvider.updateExam();
    }
  }

  getPretripDemerits() {
    
    let keys = Object.keys(this.sharedData.class417Pretest);
    let uncheckedCount = 0;

    for (let keyIdx=2; keyIdx < keys.length; keyIdx++) {
      uncheckedCount += this.sharedData.class417Pretest[keys[keyIdx]] == false ? 1 : 0;
    }

    return uncheckedCount;
  }

  finalizePretrip() {

    if (this.sharedData.class417Pretest.complete) {
      let results = this.sharedData.results.getRawValue();
      let pDemerits = this.getPretripDemerits();

      let pretripPassed = (pDemerits <= this.preTripThreshold);
      let msg = this.sharedData.formatPretripMessage(pDemerits, this.preTripThreshold, null, null);

      if (pretripPassed) {
        this.sharedData.examinationTabEnabled = true;
        this.sharedData.class417Pretest.passed = true;
        this.sharedData.presentBasicAlert("PASSED", msg);
      } else {
        results.qualified = "No";
        this.sharedData.examinationTabEnabled = false;
        this.sharedData.results.setValue(results);
        this.sharedData.presentBasicAlert("FAILED", msg);
      }

      this.saveCurrentExam();
    } else {
      this.sharedData.examinationTabEnabled = false;
    }
  }
}
