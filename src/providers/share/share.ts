import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { InAppBrowser } from "@ionic-native/in-app-browser";

/*
  Generated class for the ShareProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
 
@Injectable()
export class ShareProvider {

    leftTurn: any = {infractions: [], notes:''};
    rightTurn: any = {infractions: [], notes:''};
    roadPosition: any = {infractions: [], notes:''};
    speed: any = {infractions: [], notes:''};
    backing: any = {infractions: [], notes:''};
    shifting: any = {infractions: [], notes:''};
    rightOfWay: any = {infractions: [], notes:''};
    uncoupling: any = {infractions: [], notes:''};
    coupling: any = {infractions: [], notes:''};

    examLoadedFromDB: any = null;
    client: FormGroup;
    examiner: FormGroup;
    results: FormGroup;
    toastControl: ToastController;
    alertCtrl: AlertController;

    homeTabEnabled: boolean = true;
    detailsTabEnabled: boolean = false;
    pretripTabEnabled: boolean = false;
    examinationTabEnabled: boolean = false;
    examRevision: any = 0;
    attachments: any = [];
    signatureImg: any;
    showMaps: any = true;

    gpsData: any = [];
    gpsView: any = 'Blank';
  

    detailsCanvas;
    examinationCanvases;

    hideDemerits = {
        leftTurn: true,
        rightTurn: true,
        roadPosition: true,
        speed: true,
        backing: true,
        shifting: true,
        rightOfWay: true,
        uncoupling: true,
        coupling: true
    }

    drawingToggle: any = false;

    currentColour: string = 'primary';
    brushSize: number = 10;

    currentExam = {
        _id: null,
        _rev: null,
        licenseClass: null,
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
        results: null,
        comments: [],
        route: [],
        _attachments: {}
    };

    class1Pretest = {
        wheelsBlocked: false,
        properTools: false,
        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false
    }

    class3Pretest = {
        wheelsBlocked: false,
        properTools: false,
        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false
    }

    class2Pretest = {
        wheelsBlocked: false,
        properTools: false,
        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false
    }

    class4UPretest = {
        wheelsBlocked: false,
        properTools: false,
        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false
    }

    class417Pretest = {
        wheelsBlocked: false,
        properTools: false,
        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false
    }

    licenseClass: any = '1';
    detailsPage: any = null;
    examinationPage: any = null;
    comments = ['','','','','','','','',''];
    routeWasLoaded: any = false;

    constructor(toastControl: ToastController,
        formBuilder: FormBuilder,
        alertControl: AlertController,
        public appBrowser: InAppBrowser) {
        this.toastControl = toastControl;
        this.alertCtrl = alertControl;

        this.client = formBuilder.group({
            dlNumber: [''],
            surname: ['', Validators.compose([Validators.maxLength(30), Validators.required])],
            givenName: ['', Validators.compose([Validators.maxLength(30), Validators.required])]
        })
    
        this.examiner = formBuilder.group({
            apptTime: ['', Validators.compose([Validators.required])],
            unit: ['', Validators.compose([Validators.maxLength(10), Validators.required])],
            route: ['', Validators.compose([Validators.maxLength(10), Validators.required])],
            apptDate: ['', Validators.compose([Validators.required])],
            office: ['', Validators.compose([Validators.required])],
            initials: ['', Validators.compose([Validators.maxLength(3), Validators.required])]
        });

        this.results = formBuilder.group({
            qualified: ['Discontinued', Validators.compose([Validators.required])],
            dangerousAction: ['', Validators.compose([Validators.maxLength(100)])],
            trafficViolation: ['', Validators.compose([Validators.maxLength(100)])],
            other: ['', Validators.compose([Validators.maxLength(100)])],
        });
   }

    getDemeritCount(infractionType) {

        let count: number = 0;
    
        for (let idx=0; idx < infractionType.infractions.length; idx++) {
            if (infractionType.infractions[idx] !== null) {
                count += eval(infractionType.infractions[idx].demerits);
            }
        }
    
        return count;
    }
    
    getTotalDemeritCount() {

        let count: number = 0;

        count = this.getDemeritCount(this.leftTurn) +
                this.getDemeritCount(this.rightTurn) +
                this.getDemeritCount(this.roadPosition) +
                this.getDemeritCount(this.speed) +
                this.getDemeritCount(this.backing) +
                this.getDemeritCount(this.shifting) +
                this.getDemeritCount(this.rightOfWay) +
                this.getDemeritCount(this.uncoupling) +
                this.getDemeritCount(this.coupling);
    
        return count;
    }  
    
    badgeColor(length) {
        if (length == 0) {
          return 'good';
        } else {
          return 'bad';
        }
    }

    presentToast(message) {
        const toast = this.toastControl.create({
          message: message,
          duration: 2000
        });
        toast.present();
    }

    prepareCurrentExam() {

        if (!this.client.valid) {
          this.presentToast("Client data not valid");
          return { valid: false };
        } else if (!this.examiner.valid) {
          this.presentToast("Examination data not valid");
          return { valid: false };
        }
        
        this.currentExam.licenseClass = this.licenseClass;
        this.currentExam.client = this.client.value;
        this.currentExam.examiner = this.examiner.value;
        this.currentExam.leftTurn = this.leftTurn;
        this.currentExam.rightTurn = this.rightTurn;
        this.currentExam.roadPosition = this.roadPosition;
        this.currentExam.speed = this.speed;
        this.currentExam.backing = this.backing;
        this.currentExam.shifting = this.shifting;
        this.currentExam.rightOfWay = this.rightOfWay;
        this.currentExam.uncoupling = this.uncoupling;
        this.currentExam.coupling = this.coupling;
        this.currentExam.results = this.results.value;
        this.currentExam.comments = this.comments;
        this.currentExam.route = this.gpsData;
        for (let idx=0; idx < this.comments.length; idx++) {
            this.currentExam.comments[idx] = this.comments[idx];
        }
        return { valid: true };
    }

    presentBasicAlert(aType, message) {
        let alert = this.alertCtrl.create({
            title: aType,
            subTitle: message,
            buttons: ['Dismiss']
        });
        alert.present();
    }

    loadAttachments(dbProvider) {
        if (this.detailsPage !== null) {
            this.readDetailsAttachments(dbProvider);
        };

        if (this.examinationPage !== null) {
                this.readExamAttachments(dbProvider);
        };
    }

    readDetailsAttachments(dbProvider) {
        let canvasArray = this.detailsPage.signaturePad.toArray();
        console.log("Signature being read for id: " + this.currentExam._id);
        dbProvider.db.getAttachment(this.currentExam._id, 'signature.png')
        .then((blob) => {
          let url = URL.createObjectURL(blob);
          canvasArray[0].drawBackground(url);
       })
        .catch (e => {
            // Easiest way to test for non-existent attachment (not most efficient though)
            console.log("Can't find attachment: " + e);
            canvasArray[0].drawBackground(null);
          }) 
    }
  
    readExamAttachments(dbProvider) {
        let commentArray = this.examinationPage.canvases.toArray();
        for (let idx=0; idx < commentArray.length; idx++) {
        dbProvider.db.getAttachment(this.currentExam._id, commentArray[idx].name)
        .then((blob) => {
            let url = URL.createObjectURL(blob);
            commentArray[idx].drawBackground(url);
            commentArray[idx].wasLoaded = true;
        })
        .catch (e => {
            // Easiest way to test for non-existent attachment (not most efficient though)
            console.log("Can't find attachment: " + e);
            commentArray[idx].drawBackground(null);
            commentArray[idx].wasLoaded = false;
            }) 
        }
    }

    testOpen(dbProvider) {
        dbProvider.db.getAttachment(this.currentExam._id, 'class-5.png')
        .then((blob) => {
            let url = URL.createObjectURL(blob);
            this.appBrowser.create(url, "_blank")
        })
        .catch (e => {
            // Easiest way to test for non-existent attachment (not most efficient though)
            console.log("Can't find attachment: " + e);
        }) 
    }

    readSingleCommentAttachment(dbProvider, index) {
        let commentArray = this.examinationPage.canvases.toArray();
        dbProvider.db.getAttachment(this.currentExam._id, commentArray[index].name)
        .then((blob) => {
            let url = URL.createObjectURL(blob);
            commentArray[index].drawBackground(url);
            commentArray[index].wasLoaded = true;
        })
        .catch ((err) => {
            this.presentBasicAlert("Error", "Unable to read comment " + commentArray[index].name + ", " + err)
        });
    }

    deleteSingleCommentAttachment(dbProvider, index) {
        let commentArray = this.examinationPage.canvases.toArray();
        dbProvider.db.removeAttachment(this.currentExam._id, commentArray[index].name, this.currentExam._rev) 
        .then((response) => {
            commentArray[index].wasLoaded = false;
            let dashPos = response.rev.indexOf('-');
            let revision = response.rev.substring(0, dashPos);

            this.currentExam._id = response.id;
            this.currentExam._rev = response.rev;
            this.examRevision = revision;
            this.presentToast("Deleted comment: " + commentArray[index].name)
        })
        .catch ((err) => {
            this.presentBasicAlert("Error", "Unable to delete comment " + commentArray[index].name + ", " + err)
        });
    }
}
