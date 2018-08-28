import { Component, ViewChildren } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';
import { ModalController, IonicPage } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { CommercialDbProvider } from '../../providers/commercial-db/commercial-db';
import { CanvasDrawComponent } from '../../components/canvas-draw/canvas-draw';
import { FileOpener } from '@ionic-native/file-opener';
/**
 * Generated class for the DetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  priority: 'low'
})
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {

  @ViewChild('testSlider') slider;
  @ViewChildren(CanvasDrawComponent) signaturePad;

  dbProvider: CommercialDbProvider;
  sharedData: ShareProvider = null;
  modalController: ModalController = null;
  http: Http = null;
  client: FormGroup;
  examiner: FormGroup;
  submitAttempt: boolean = false;
  masks: any;
  phoneNumber: any;
  classes: any = ['1','3','20','07','2','4U','4_17']

  constructor(public navCtrl: NavController, 
    shareProvider: ShareProvider, 
    modalController: ModalController,
    dbProvider: CommercialDbProvider,
    http: Http,
    public fileOpener: FileOpener,
    public formBuilder: FormBuilder) {
      this.sharedData = shareProvider;
      this.modalController = modalController;
      this.http = http;
      this.dbProvider = dbProvider;
      //this.sharedData.detailsCanvas = this.signaturePad;

      this.masks = {
        dlNumber: ['D', 'L', ':', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
        phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
        cardNumber: [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
        cardExpiry: [/[0-1]/, /\d/, '/', /[1-2]/, /\d/],
        orderCode: [/[a-zA-z]/, ':', /\d/, /\d/, /\d/, /\d/]
    };
  }

  slideChanged() {
    // Set the licenseClass to match the image selected
    this.sharedData.licenseClass = this.classes[this.slider.getActiveIndex()];

    // Set the target link of the pretrip tab to the page matching the license class
    let tabIndex = 2; // Pretrip Tab Index
    let myTab = this.navCtrl.parent.getByIndex(tabIndex);
    myTab.setRoot('Pretrip' + this.sharedData.licenseClass + 'Page');
  }

  saveCurrentExam() {
    if (this.sharedData.prepareCurrentExam().valid) {
      this.dbProvider.updateExam();
    }
  }

  redrawBackground(url) {   
    let signatureArray = this.signaturePad.toArray(); 
    signatureArray[0].drawBackground(url);
    signatureArray[0].dirty = true;
  }

  /**
   * The pretrip page is assigned to the pretrip tab dynamically at run time based on the license class. The default
   * page assigned to that tab is the details page (for no particular reason). This code deals with strange 
   * behaviour where the *first* time you click on the pretrip tab it loads the appropriate pretrip page but 
   * loads the default page (in this case details) on top, showing a back button in the Navbar. This function detects 
   * whether the back button for this invocation of details is enabled. As this is not a valid state 
   * (details is assigned to a tab as a root page only) the page will be popped off the stack revealing the 
   * correct pretrip page underneath. 
   */

  ionViewWillEnter() {

    let ctrlr = this.navCtrl.getActive();
    if (ctrlr.enableBack()) {
      this.navCtrl.pop();
    }
  }

  ionViewDidEnter() {
    // Set offset of licensClass slider
    let idx=0;

    while (this.sharedData.licenseClass != this.classes[idx]) {
      idx++;
    }
  
    this.slider.slideTo(idx);
    this.sharedData.detailsCanvas = this.signaturePad;

    // Initialize all canvas elements to blank backgrounds
    let canvasList = this.sharedData.detailsCanvas.toArray();
    this.sharedData.drawingToggle = false;
    
    for (let canvasIdx=0; canvasIdx < canvasList.length; canvasIdx++) {
      canvasList[canvasIdx].drawBackground();
    }
      
    this.sharedData.detailsPage = this;
    this.sharedData.readDetailsAttachments(this.dbProvider);
    console.log('ionViewDidLoad DetailsPage');
  }

  ionViewDidLoad() {
    
    this.dbProvider.getRoutes().then((data) => {
      let docs: any = data;
      this.sharedData.routes = docs[0].routeList;
    })
    .catch((e) => console.log("Unable to get the routes from PouchDB"));
  }
}
