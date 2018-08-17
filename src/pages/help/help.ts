import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';

/**
 * Generated class for the HelpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  priority: "low"
})
@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public sharedData: ShareProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpPage');
  }

  ionViewDidLeave() {
    this.sharedData.activeMenuPage = '';
  }
}
