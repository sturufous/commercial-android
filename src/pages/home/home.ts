import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';
import { ModalController } from 'ionic-angular';
import { Http } from '@angular/http';
import { CommercialDbProvider } from '../../providers/commercial-db/commercial-db';

export class UserProfile {
  _id: string;
  _rev: string;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  soundNotifications: boolean;
  speedMargin: number;
  updateInterval: number;
 
  constructor(
  _id: string,
  _rev: string,
  firstName: string, 
  lastName: string, 
  soundNotification: boolean,
  speedMargin: number,
  updateInterval: number,
  email: string) {
    this._id = _id;
    this._rev = _rev;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.soundNotifications = soundNotification;
    this.speedMargin = speedMargin;
    this.updateInterval = updateInterval;
  }
}

@IonicPage({
  priority: 'low'
})
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
    http: Http) {
 
      this.sharedData = shareProvider;
      this.modalController = modalController;
      this.dbProvider = dbProvider;
      this.http = http;
  }

  newExam() {
    let examTemplate = {
      type: 'exam',
      licenseClass: '', 
      client: null, 
      examiner: null,
      pretrip: null,
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
      id: '',
      _attachments: {},
      comments: ['','','','','','','','','']
    };

    examTemplate.licenseClass = '1';
    examTemplate.pretrip = this.sharedData.class1PretestDefaults;

    // Blank out all pre-existing pre-trip test data
    this.sharedData.class1Pretest = this.sharedData.class1PretestDefaults;
    this.sharedData.class3Pretest = this.sharedData.class3PretestDefaults;
    this.sharedData.class2Pretest = this.sharedData.class2PretestDefaults;
    this.sharedData.class4UPretest = this.sharedData.class4UPretestDefaults;
    this.sharedData.code07Pretest = this.sharedData.code07PretestDefaults;
    this.sharedData.code20Pretest = this.sharedData.code20PretestDefaults;
    this.sharedData.class417Pretest = this.sharedData.class417PretestDefaults;

    examTemplate.client = {
        dlNumber: 'DL:1234567',
        surname: '', 
        givenName: ''
    };
    examTemplate.examiner = {
        apptDate: new Date(), 
        apptTime: '12:30',
        unit: '345',
        route: 'Route1',
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

    this.setPretripDefaults();

    switch (exam.licenseClass) {
      case '1':
        this.sharedData.class1Pretest = exam.pretrip;
        break;
      case '3':
        this.sharedData.class3Pretest = exam.pretrip;
        break;
      case '2':
        this.sharedData.class2Pretest = exam.pretrip;
        break;
      case '20':
        this.sharedData.code20Pretest = exam.pretrip;
        break;
      case '07':
        this.sharedData.code07Pretest = exam.pretrip;
        break;
      case '4U':
        this.sharedData.class4UPretest = exam.pretrip;
        break;
      case '4_17':
        this.sharedData.class417Pretest = exam.pretrip;
        break;
      default:
        break;
    }

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

    // Set the target link of the pretrip tab to the page matching the license class
    let tabIndex = 2; // Pretrip Tab Index
    let myTab = this.navCtrl.parent.getByIndex(tabIndex);
    myTab.setRoot('Pretrip' + exam.licenseClass + 'Page');
    
    // Set all demerit lists (including comments) to invisible
    let keys = Object.keys(this.sharedData.hideDemerits);
    for(let idx=0; idx < keys.length; idx++) {
      this.sharedData.hideDemerits[keys[idx]] = true;
    }

    // Attachements will be loaded by their respective pages

    this.navCtrl.parent.select(1);
  }

  setPretripDefaults() {
    // Clear any leftover pretrip selections from previous exam
    this.sharedData.class1Pretest = this.sharedData.class1PretestDefaults;
    this.sharedData.class3Pretest = this.sharedData.class3PretestDefaults;
    this.sharedData.class2Pretest = this.sharedData.class2PretestDefaults;
    this.sharedData.class4UPretest = this.sharedData.class4UPretestDefaults;
    this.sharedData.code07Pretest = this.sharedData.code07PretestDefaults;
    this.sharedData.code20Pretest = this.sharedData.code20PretestDefaults;
    this.sharedData.class417Pretest = this.sharedData.class417PretestDefaults;
  }

  ionViewDidLoad() {

    // Possible asyc issue, but probably not
    this.dbProvider.loadRouteNames();
  }

  ionViewDidEnter() {

    this.dbProvider.getExams().then((data) => {
      this.exams = data;
    })
    .catch((e) => console.log("Unable to get exam records from PouchDB"));

    this.dbProvider.getProfile("xy5t").then((data) => {
      let profData: any = data;
      this.sharedData.userProfile = profData.docs[0];
    })
    .catch((e) => console.log("Unable to get user profile from PouchDB"));
  }
}
