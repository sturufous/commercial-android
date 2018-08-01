import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';
import { ModalController } from 'ionic-angular';
import { Http } from '@angular/http';
import { CommercialDbProvider } from '../../providers/commercial-db/commercial-db';
import { SplashScreen } from '@ionic-native/splash-screen';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  sharedData: ShareProvider = null;
  modalController: ModalController = null;
  http: Http = null;
  dbProvider: CommercialDbProvider;
  exams: any;

  constructor(
    public navCtrl: NavController, 
    shareProvider: ShareProvider, 
    modalController: ModalController,
    dbProvider: CommercialDbProvider,
    http: Http,
    public splashScreen: SplashScreen) {
 
      this.sharedData = shareProvider;
      this.modalController = modalController;
      this.dbProvider = dbProvider;
      this.http = http;
  }

  newExam() {
    let examTemplate = {
      licenseClass: '', 
      client: null, 
      examiner: null,
      leftTurn: {infractions: [], notes:''},
      rightTurn: {infractions: [], notes:''},
      roadPosition: {infractions: [], notes:''},
      speed: {infractions: [], notes:''},
      backing: {infractions: [], notes:''},
      shifting: {infractions: [], notes:''},
      rightOfWay: {infractions: [], notes:''},
      uncoupling: {infractions: [], notes:''},
      coupling: {infractions: [], notes:''},
      results: {dangerousAction: '', trafficViolation: '', other: '', qualified: ''},
      route: [],
      _attachments: {},
      comments: ['','','','','','','','','']
    };

    examTemplate.licenseClass = '1';
    examTemplate.client = {
        dlNumber: 'DL:1234567',
        surname: '', 
        givenName: ''
    };
    examTemplate.examiner = {
        apptDate: new Date(), 
        apptTime: '12:30',
        unit: '345',
        route: '4',
        office: '12345',
        initials: 'SM'
    }; 
    examTemplate.results = {
      dangerousAction: '',
      trafficViolation: '',
      other: '',
      qualified: 'Discontinued'
    }
    examTemplate._attachments = {};
    examTemplate.route = [];
    this.sharedData.gpsData = [];
    this.sharedData.routeWasLoaded = false;

    // If examinationPage has been loaded, clear all comment canvases and ensure old
    // canvas contents will not be saved against the new record
    if (this.sharedData.examinationPage != null ){
      let canvasList = this.sharedData.examinationCanvases.toArray();
      for (let canvasIdx=0; canvasIdx < canvasList.length; canvasIdx++) {
        canvasList[canvasIdx].drawBackground(null);
        canvasList[canvasIdx].wasLoaded = false;
        canvasList[canvasIdx].dirty = false;
      }
  
    }

    this.dbProvider.navCtrl = this.navCtrl;
    this.dbProvider.createExam(examTemplate);
  }

  deleteExam(exam) {
    this.dbProvider.deleteExam(exam);
  }

  openExam(exam) {
    this.sharedData.currentExam._attachments = exam._attachments;
    let idx = exam._rev.indexOf('-');
    let revision = exam._rev.substring(0, idx);

    this.sharedData.detailsTabEnabled = true;
    this.sharedData.examinationTabEnabled = true;
    this.sharedData.pretripTabEnabled = true;

    this.sharedData.currentExam = exam;
    this.sharedData.examRevision = revision;

    this.sharedData.licenseClass = exam.licenseClass; 

    this.sharedData.client.setValue(exam.client);
    this.sharedData.examiner.setValue(exam.examiner);
    this.sharedData.results.setValue(exam.results);

    this.sharedData.leftTurn = exam.leftTurn;
    this.sharedData.rightTurn = exam.rightTurn;
    this.sharedData.roadPosition = exam.roadPosition;
    this.sharedData.speed = exam.speed;
    this.sharedData.backing = exam.backing;
    this.sharedData.shifting = exam.shifting;
    this.sharedData.rightOfWay = exam.rightOfWay;
    this.sharedData.uncoupling = exam.uncoupling;
    this.sharedData.coupling = exam.coupling;
    this.sharedData.loadAttachments(this.dbProvider);
    this.sharedData.comments = exam.comments;
  
    if (exam.route.length > 0) {
      this.sharedData.routeWasLoaded = true;
      this.sharedData.gpsData = exam.route;
    } else {
      this.sharedData.routeWasLoaded = false;
      this.sharedData.gpsData = [];
    }

    // Set all demerit lists (including comments) to invisible
    let keys = Object.keys(this.sharedData.hideDemerits);
    for(let idx=0; idx < keys.length; idx++) {
      this.sharedData.hideDemerits[keys[idx]] = true;
    }

    // Attachements will be loaded by their respective pages

    this.navCtrl.parent.select(1);
  }


  ionViewDidEnter() {
    this.splashScreen.hide();

    this.dbProvider.getExams().then((data) => {
      this.exams = data;
    })
    .catch((e) => console.log("Unable to get exams from PouchDB"));
  }
}
