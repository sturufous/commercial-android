import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';

/**
 * Generated class for the GraphicToolsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-graphic-tools',
  templateUrl: 'graphic-tools.html',
})
export class GraphicToolsPage {

  availableColours = [
    'primary',
    'secondary',
    'danger',
    'dark'
  ];

constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public sharedData: ShareProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GraphicToolsPage');
  }

  setPenSize(size) {
    this.sharedData.brushSize = size;
  }

  changeColour(colour){
    this.sharedData.currentColour = colour;
  }
}
