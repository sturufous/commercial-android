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

    // Set keyIdx to 2 to skip the 'class' and 'done' fields
    for (let keyIdx=2; keyIdx < keys.length; keyIdx++) {
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

  finalizePretrip() {

    if (this.sharedData.class1Pretest.complete) {
      let results = this.sharedData.results.getRawValue();
      let aDemerits = this.getAirBrakeDemerits();
      let pDemerits = this.getPretripDemerits();

      let airPretripPassed = (aDemerits <= this.airBrakeThreshold);
      let pretripPassed = (pDemerits <= this.preTripThreshold);
      let msg = this.sharedData.formatPretripMessage(pDemerits, this.preTripThreshold, aDemerits, this.airBrakeThreshold);

      if (airPretripPassed && pretripPassed) {
        this.sharedData.examinationTabEnabled = true;
        this.sharedData.class1Pretest.passed = true;
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
