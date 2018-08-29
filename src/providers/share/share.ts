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

    routes: any = [];

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
    currentRouteGeo: any;

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

    examDefaults = {
        _id: null,
        _rev: null,
        type: 'exam',
        licenseClass: null,
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
        results: null,
        comments: [],
        route: [],
        id: null,
        _attachments: {}
    };

    currentExam = this.examDefaults;
    currentPretripPage = 'Pretrip1Page';

    class1PretestDefaults = {
        class: '1',
        complete: false,
        passed: false,
        wheelsBlocked: false,
        properTools: false,

        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false,

        chargeRate: false,
        defroster: false,
        emergencyEquipment: false,
        fuelGuage: false,
        horn: false,
        panelLights: false,
        mirrors: false,
        oilPressure: false,
        seatsBelts: false,
        windowsCondition: false,
        wipersWasher: false,

        battery: false,
        bodyFrame: false,
        doors: false,
        driveShafts: false,
        exhaust: false,
        fuelCap: false,
        inspectionDecals: false,
        landingGear: false,
        plates: false,
        loadSecurity: false,
        mudFlaps: false,
        axleAssembly: false,
        storageCompartments: false,
        suspension: false,

        headlights: false,
        emergencyFlashers: false,
        turnSignals: false,
        tailLights: false,
        brakeLights: false,
        licenseLights: false,

        tireCondition: false,
        lugNuts: false,
        hubOil: false,
        rims: false,

        electricalCable: false,
        fifthWheelLock: false,
        hitchChainsCables: false,

        completedCorrectly: false,

        airBrake: {
            supplyReservoir: false,
            airCompressor: false,
            lowPressureWarning: false,
            airLines: false,
            brakeChambers: false,
            buildUpTime: false,
            governorOperation: false,
            pushRodTravel: false,
            leakageTest: false,

            supplyValve: false,
            trailerBrakes: false,
            gladHandsDisc: false,
            serviceBrake: false,

            tractorPark: false,
            trailerPark: false,
            handValve: false,
            footValve: false
        }
    }

    class3PretestDefaults = {
        class: '3',
        complete: false,
        passed: false,
        wheelsBlocked: false,
        properTools: false,

        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false,

        chargeRate: false,
        defroster: false,
        emergencyEquipment: false,
        fuelGuage: false,
        horn: false,
        panelLights: false,
        mirrors: false,
        oilPressure: false,
        seatsBelts: false,
        windowsCondition: false,
        wipersWasher: false,

        battery: false,
        bodyFrame: false,
        doors: false,
        driveShafts: false,
        exhaust: false,
        fuelCap: false,
        inspectionDecals: false,
        landingGear: false,
        plates: false,
        loadSecurity: false,
        mudFlaps: false,
        axleAssembly: false,
        storageCompartments: false,
        suspension: false,

        headlights: false,
        emergencyFlashers: false,
        turnSignals: false,
        tailLights: false,
        brakeLights: false,
        licenseLights: false,

        tireCondition: false,
        lugNuts: false,
        hubOil: false,
        rims: false,

        electricalCable: false,
        fifthWheelLock: false,
        hitchChainsCables: false,

        completedCorrectly: false,

        airBrake: {
            supplyReservoir: false,
            airCompressor: false,
            lowPressureWarning: false,
            airLines: false,
            brakeChambers: false,
            buildUpTime: false,
            governorOperation: false,
            pushRodTravel: false,
            leakageTest: false,

            footValve: false,
            parkingBrakeYellow: false
        },
    }

    code07PretestDefaults = {
        code: '07',
        complete: false,
        passed: false,
        wheelsBlocked: false,

        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false,
        battery: false,

        chargeRate: false,
        defrosterHeater: false,
        emergencyEquipment: false,
        fuelGuage: false,
        horn: false,
        panelLights: false,
        mirrors: false,
        oilPressure: false,
        seatsBelts: false,
        windowsCondition: false,
        wipersWasher: false,

        bodyFrame: false,
        doors: false,
        exhaust: false,
        fuelCap: false,
        legsLandingGear: false,
        plates: false,
        loadSecurement: false,
        mudFlaps: false,
        suspension: false,
        storageCompartments: false,

        headlights: false,
        emergencyFlashers: false,
        turnSignals: false,
        tailLights: false,
        brakeLights: false,
        licenseLights: false,

        tireCondition: false,
        lugNuts: false,
        rims: false,

        electricalCable: false,
        fifthWheelLock: false,
        hitchChainsCables: false,

        parkingBrake: false,
        serviceBrake: false,
        trailerBrake: false,
        breakawaySwitch: false,

        propaneTanks: false,
        stepsLadders: false,
        awning: false,
        appliances: false,
        slideOuts: false,
        insideSecurity: false
    }

    code20PretestDefaults = {
        code: '20',
        complete: false,
        passed: false,
        wheelsBlocked: false,

        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false,
        battery: false,

        chargeRate: false,
        defrosterHeater: false,
        emergencyEquipment: false,
        fuelGuage: false,
        horn: false,
        panelLights: false,
        mirrors: false,
        oilPressure: false,
        seatsBelts: false,
        windowsCondition: false,
        wipersWasher: false,

        bodyFrame: false,
        doors: false,
        exhaust: false,
        fuelCap: false,
        legsLandingGear: false,
        plates: false,
        loadSecurement: false,
        mudFlaps: false,
        suspension: false,
        storageCompartments: false,

        headlights: false,
        emergencyFlashers: false,
        turnSignals: false,
        tailLights: false,
        brakeLights: false,
        licenseLights: false,

        tireCondition: false,
        lugNuts: false,
        rims: false,

        electricalCable: false,
        fifthWheelLock: false,
        hitchChainsCables: false,

        parkingBrake: false,
        serviceBrake: false,
        trailerBrake: false,
        breakawaySwitch: false,
    }

    class2PretestDefaults = {
        class: '2',
        complete: false,
        passed: false,
        wheelsBlocked: false,
        properTools: false,

        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false,

        chargeRate: false,
        defrosterHeater: false,
        emergencyEquipment: false,
        fuelGuage: false,
        horn: false,
        panelLights: false,
        interiorLights: false,
        mirrors: false,
        oilPressure: false,
        seatsBelts: false,
        windowsCondition: false,
        wipersWasher: false,

        battery: false,
        bodyFrame: false,
        doors: false,
        driveShafts: false,
        exhaust: false,
        fuelCap: false,
        inspectionDecals: false,
        plates: false,
        loadSecurity: false,
        mudFlaps: false,
        storageCompartments: false,
        suspension: false,

        headlights: false,
        emergencyFlashers: false,
        turnSignals: false,
        tailLights: false,
        brakeLights: false,
        licenseLights: false,

        tireCondition: false,
        lugNuts: false,
        hubOil: false,
        rims: false,

        parkingBrake: false,
        serviceBrake: false,

        busLights: false,
        stopSign: false,
        emergencyExits: false,
        passengerSeatsBelts: false,

        completedCorrectly: false,

        airBrake: {
            supplyReservoir: false,
            airCompressor: false,
            lowPressureWarning: false,
            brakeChambers: false,
            buildUpTime: false,
            governorOperation: false,
            pushRodTravel: false,
            leakageTest: false,

            footValve: false,
            parkingBrakeYellow: false
        }
    }

    class4UPretestDefaults = {
        class: '4U',
        complete: false,
        passed: false,
        wheelsBlocked: false,
        properTools: false,

        leaks: false,
        engineOil: false,
        coolant: false,
        otherFluids: false,
        belts: false,
        hoses: false,
        steeringComponents: false,
        chargeRate: false,
        defrosterHeater: false,
        emergencyEquipment: false,
        fuelGuage: false,
        horn: false,
        panelLights: false,
        interiorLights: false,
        mirrors: false,
        oilPressure: false,
        seatsBelts: false,
        windowsCondition: false,
        wipersWasher: false,

        battery: false,
        bodyFrame: false,
        doors: false,
        driveShafts: false,
        exhaust: false,
        fuelCap: false,
        inspectionDecals: false,
        plates: false,
        loadSecurity: false,
        mudFlaps: false,
        storageCompartments: false,
        suspension: false,

        headlights: false,
        emergencyFlashers: false,
        turnSignals: false,
        tailLights: false,
        brakeLights: false,
        licenseLights: false,

        tireCondition: false,
        lugNuts: false,
        hubOil: false,
        rims: false,

        parkingBrake: false,
        serviceBrake: false,

        busLights: false,
        stopSign: false,
        emergencyExits: false,
        passengerSeatsBelts: false,

        completedCorrectly: false
    }

    class417PretestDefaults = {
        class: '4_17',
        complete: false,
        passed: false,
        parkingBrakeSet: false,

        engineOil: false,
        coolant: false,
        battery: false,
        belts: false,
        hoses: false,
        leaks: false,
        otherFluids: false,

        defrosterHeater: false,
        fuelGuage: false,
        horn: false,
        interiorLights: false,
        mirrors: false,
        seatBelts: false,
        windowsCondition: false,
        wipersWasher: false,

        bodyFrame: false,
        doors: false,
        exhaust: false,
        fuelCap: false,
        licensePlates: false,
        trunk: false,

        headlights: false,
        emergencyFlashers: false,
        turnSignals: false,
        tailLights: false,
        brakeLights: false,
        licenseLights: false,

        tireCondition: false,
        lugNuts: false,

        parkingBrake: false,
        serviceBrake: false
    }

    class1Pretest = this.class1PretestDefaults;
    class3Pretest = this.class3PretestDefaults;
    class2Pretest = this.class2PretestDefaults;
    class4UPretest = this.class4UPretestDefaults;
    code07Pretest = this.code07PretestDefaults;
    code20Pretest = this.code20PretestDefaults;
    class417Pretest = this.class417PretestDefaults;

    userProfile;

    licenseClass: any = '1';
    detailsPage: any = null;
    examinationPage: any = null;
    comments = ['','','','','','','','',''];
    routeWasLoaded: any = false;
    routeGuideDrawn: any = false;
    trackingIsOn: Boolean = false;
    activeMenuPage: any = '';

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
            route: ['', Validators.compose([Validators.required])],
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
    
    badgeColor(length, threshold) {
        
        if (length == 0) {
            return 'good';
        } else if (length <= threshold) {
            return 'ok';
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

        switch (this.licenseClass) {
            case '1':
                this.currentExam.pretrip = this.class1Pretest;
                break;
            case '3':
                this.currentExam.pretrip = this.class3Pretest;
                break;
            case '2':
                this.currentExam.pretrip = this.class2Pretest;
                break;
            case '20':
                this.currentExam.pretrip = this.code20Pretest;
                break;
            case '07':
                this.currentExam.pretrip = this.code07Pretest;
                break;
            case '4U':
                this.currentExam.pretrip = this.class4UPretest;
                break;
            case '4_17':
                this.currentExam.pretrip = this.class417Pretest;
                break;
            default:
               break;
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

    /*
    {
        "_id": "Route1",
        "_rev": "2-9ae25e438383ad377f4b76c1dfb41607",
        "name": "Route1",
        "route": "route1.geojson",
        "speed_zones": {
          "zones": {
            "30": "route1_30kmh.geojson",
            "40": "route1_40kmh.geojson",
            "50": "route1_50kmh.geojson"
          }
        },
        "_attachments": {
          "route1.geojson": {
            "content_type": "application/octet-stream",
            "revpos": 2,
            "digest": "md5-qh1CdpB/6GUWKICqzvP7LQ==",
            "length": 712,
            "stub": true
          }
        }
      } */

    readCurrentRoute(dbProvider) {
        let canvasArray = this.detailsPage.signaturePad.toArray();
        console.log("Route being read: " + this.currentExam._id);
        dbProvider.db.getAttachment('Route1', 'route1.geojson')
        .then((blob) => {
          let url = URL.createObjectURL(blob);
          this.currentRouteGeo = url;
        })
        .catch (e => {
            console.log("Can't find attachment: " + e);
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

    formatPretripMessage(pDemerits, pThreshold, aDemerits, aThreshold) {
    
        let message = 
          '<table>' +
          '<tr><td colspan="2"><h3>Pretrip Complete</h3></td></tr>' +
          '<tr><td>Pretrip Demerits:&nbsp;</td><td style="white-space: nowrap">' + pDemerits + '</td></tr>' +
          '<tr><td>Pretrip Threshold:&nbsp;</td><td style="white-space: nowrap">' + pThreshold + '</td></tr>';

        if (aDemerits !== null) {
          message +=
          '<tr><td>Airbrake Demerits:&nbsp;</td><td>' + aDemerits + '</td></tr>' +
          '<tr><td>Airbrake Threshold:&nbsp;</td><td>' + aThreshold + '</td></tr>';
        }

        message +=  '</table>';
    
        return message;
    }
    
    // Handles situation where side menu is accessed before user profile is loaded
    getFirstName() {
        return typeof this.userProfile != 'undefined' ? this.userProfile.firstName : '';
    }

    // Handles situation where side menu is accessed before user profile is loaded
    getLastName() {
        return typeof this.userProfile != 'undefined' ? this.userProfile.lastName : '';
    }

     // Handles situation where side menu is accessed before user profile is loaded
     getId() {
        return typeof this.userProfile != 'undefined' ? this.userProfile._id : '';
    }

    // Handles situation where side menu is accessed before user profile is loaded
    getGpsDebugFlag() {
        return typeof this.userProfile != 'undefined' ? this.userProfile.gpsDebugFlag : false;
    }

    // Handles situation where side menu is accessed before user profile is loaded
    getUpdateInterval() {
        let updateInterval = 0;

        if (typeof this.userProfile != 'undefined') {
            updateInterval = eval(this.userProfile.updateInterval + ' * ' + '1000');
        } else {
            updateInterval = 5000;
        }

        return updateInterval;
    }
}
