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

@IonicPage()
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
  classes: any = ['1','3','2','4U','4-17']

  constructor(public navCtrl: NavController, 
    shareProvider: ShareProvider, 
    modalController: ModalController,
    dbProvider: CommercialDbProvider,
    http: Http,
    navparams: NavParams,
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
    this.sharedData.licenseClass = this.classes[this.slider.getActiveIndex()];
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
    
    for (let canvasIdx=0; canvasIdx < canvasList.length; canvasIdx++) {
      canvasList[canvasIdx].drawBackground();
    }
      
    this.sharedData.detailsPage = this;
    this.sharedData.readDetailsAttachments(this.dbProvider);
    console.log('ionViewDidLoad DetailsPage');
  }

  testOpenUrl() {
    this.sharedData.testOpen(this.dbProvider);
  }
}
