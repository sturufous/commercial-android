import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchdbFind from 'pouchdb-find';
import { ShareProvider } from '../share/share';
import { NavController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';

/*
  Generated class for the CommercialDbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommercialDbProvider {

  db: any;
  remote: any;
  data: any;

  sharedData: ShareProvider;
  navCtrl: NavController;
  canvasIndex: any = 0;

  constructor(
    shareProvider: ShareProvider,
    public httpObj: HTTP
  ) {
    this.db = new PouchDB('commercial-db');
    this.remote = "https://1801a103-f342-4909-8289-42b1f4c948fa-bluemix.cloudant.com/commercial-db";
    this.sharedData = shareProvider;
    PouchDB.plugin(PouchdbFind);

    let options = {
      live: true,
      retry: true,
      continuous: true
    };

    this.db.sync(this.remote, options);
  }

  getExams() {
 
    if (this.data) {
      return Promise.resolve(this.data);
    }
   
    return new Promise(resolve => {
      this.db.allDocs({
        include_docs: true
      }).then((result) => {
        this.data = [];
    
        let docs = result.rows.map((row) => {
          // Include only exam records in data, not routes, messages etc.
          if (row.doc.type == 'exam') {
            row.doc.id = row.id;
            this.data.push(row.doc);
          }
        });
    
        resolve(this.data);
    
        this.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
          this.handleChange(change);
      });
    })
    .catch (e => this.sharedData.presentBasicAlert("Error", e));

    });
  }

  getDocById(key) {
    let me = this;
  
    return new Promise(resolve => {
      this.db.find({
        selector: {
          _id: key
        }
      }).then((res) => {
        resolve(res);
      }).catch((err) => { 
        console.log('Error getting user profile')
      });
    })
  }

  getProfile(userId) {

    return this.getDocById(userId);
  }
    
  getRoutes() {
    return this.getDocById("routes");
  }

  handleChange(change) {

    console.log("Entering handleChange(): " + JSON.stringify(change));
    let changedDoc = null;
    let changedIndex = null;
   
    for (let docIdx = 0; docIdx < this.data.length; docIdx++) {
  
      if (this.data[docIdx].id === change.id) {
        changedDoc = this.data[docIdx];
        changedIndex = docIdx;
      }
    };
  
    //A document was deleted
    if (change.deleted) {
      this.data.splice(changedIndex, 1);
      console.log("A document was deleted " + changedIndex + " = " + JSON.stringify(this.data));
    }
    else {
  
      //A document was updated
      if (changedDoc) {
        console.log("A document was updated " + changedIndex)
        this.data[changedIndex] = change.doc;
      }
  
      //A document was added
      else {
        console.log("A document was added " + changedIndex)
        this.data.push(change.doc);
      }
    }
  }

  createExam(exam) { 
      this.db.post(exam).then((response) => {
        let idx = response.rev.indexOf('-');
        let revision = response.rev.substring(0, idx);
        
        this.sharedData.currentExam._id = response.id;
        this.sharedData.currentExam._rev = response.rev;
        this.sharedData.examRevision = revision;

        this.sharedData.currentExam.client = exam.client;
        this.sharedData.currentExam.examiner = exam.examiner;
        this.sharedData.currentExam._attachments = exam._attachments;
        this.sharedData.leftTurn = exam.leftTurn;
        this.sharedData.rightTurn = exam.rightTurn;
        this.sharedData.roadPosition = exam.roadPosition;
        this.sharedData.speed = exam.speed;
        this.sharedData.backing = exam.backing;
        this.sharedData.shifting = exam.shifting;
        this.sharedData.rightOfWay = exam.rightOfWay;
        this.sharedData.uncoupling = exam.uncoupling;
        this.sharedData.coupling = exam.coupling;
        this.sharedData.examRevision = revision;
        this.sharedData.gpsData = [];

        this.sharedData.client.setValue(exam.client);
        this.sharedData.examiner.setValue(exam.examiner);
        this.sharedData.results.setValue(exam.results);
        this.sharedData.detailsTabEnabled = true;
        this.sharedData.examinationTabEnabled = true;
        this.sharedData.pretripTabEnabled = true;

        this.sharedData.presentToast("New Record Created");
        this.navCtrl.parent.select(1); // Jump to Details tab     
      })
      .catch (e => this.sharedData.presentBasicAlert("Error", e));
  }
    
  updateExam() { 

    this.db.put(this.sharedData.currentExam).then((response) => {
      
      let idx = response.rev.indexOf('-');
      let revision = response.rev.substring(0, idx);
      let canvasArray = [];
      let signatureArray;

      console.log("in updateExam: " + JSON.stringify(this.sharedData.currentExam));

      this.sharedData.currentExam._id = response.id;
      this.sharedData.currentExam._rev = response.rev;
      this.sharedData.examRevision = revision;
      this.sharedData.presentToast("Exam updated successfully")

      // Canvases will be undefined until page is loaded. There will, however,
      // always be a signature canvas as the details page is always loaded when
      // updateExam() is called. Still check though:
      
      if (typeof this.sharedData.detailsCanvas != 'undefined') {
        signatureArray = this.sharedData.detailsCanvas.toArray();
      }

      let canvasList = this.sharedData.examinationCanvases;
      if (typeof canvasList != 'undefined') {
        canvasArray = canvasList.toArray();
      }

      if (typeof signatureArray != 'undefined') {
        canvasArray.push(signatureArray[0]);
      }

      this.canvasIndex = 0;
      this.saveCanvasAttachments(canvasArray);
    })
    .catch (e => this.sharedData.presentBasicAlert("Error", e));
  }

  updateUserProfile() {
    this.db.put(this.sharedData.userProfile).then((response) => {
      this.sharedData.presentToast("User profile saved successfully.");
      this.sharedData.userProfile._rev = response.rev;
    })
    .catch (e => this.sharedData.presentBasicAlert("Error", e));
  }

  saveCanvasAttachments(canvasList) {
    //let currentCanvas = canvasList[this.canvasIndex];
    if (this.canvasIndex < canvasList.length) {
      if (canvasList[this.canvasIndex].dirty) {
        canvasList[this.canvasIndex].dirty = false; // This should be done later  
        canvasList[this.canvasIndex].wasLoaded = true;
        //canvasList[this.canvasIndex].wasLoaded = false; //   
        canvasList[this.canvasIndex].canvas.nativeElement.toBlob((blob) => {
          this.db.putAttachment(
            this.sharedData.currentExam._id, 
            canvasList[this.canvasIndex].getName(),
            this.sharedData.currentExam._rev,
            blob,
            'image/png',
          )
          .then((response) => {
            console.log("In handler for put attachment")
            let dashPos = response.rev.indexOf('-');
            let revision = response.rev.substring(0, dashPos);

            this.sharedData.currentExam._id = response.id;
            this.sharedData.currentExam._rev = response.rev;
            this.sharedData.examRevision = revision;
            this.canvasIndex++;
            this.saveCanvasAttachments(canvasList);
          })
        }
      )
    } else {
      this.canvasIndex++;
      this.saveCanvasAttachments(canvasList);
    }
  }
}
    
  deleteExam(exam){
    this.db.remove(exam).catch((err) => {
      console.log(err);
    });
  }

  extractRouteCoords(geoJsonContent) {

    let arrayCoords = geoJsonContent.features[0].geometry.coordinates;
    let objCoords = [];
    for (let idx=0; idx < arrayCoords.length; idx++) {
      objCoords.push({ lat: arrayCoords[idx][1], lng: arrayCoords[idx][0] });
    }
    return objCoords;
  }

  loadExamRouteCoords(routeNbr) {

    let me = this;
    
    return new Promise(resolve => {
      this.db.find({
        attachments: true,
        selector: {
          _id: routeNbr
        }
      }).then((res) => {
        let routeAttachment = res.docs[0].route;
        this.db.getAttachment(routeNbr, routeAttachment)
        .then((blob) => {
          var reader = new FileReader();
          reader.onload = () => {
            let geo: any[] = JSON.parse(reader.result);
            let routeCoords = me.extractRouteCoords(geo);
            resolve(routeCoords);
          }
          reader.readAsText(blob);
        })
        .catch ((err) => {
            this.sharedData.presentBasicAlert("Error", "Unable to read route " + routeAttachment + ", " + err)
        });

        console.log("Result = " + res);
      }).catch((err) => { 
        console.log('Error getting Route1')
      });
    })
  }

  extractSpeedZoneCoords(geoJsonContent) {

    let features = geoJsonContent.features;
    let polyCorners = [];
    let speedZones = [];

    for(let featureIdx=0; featureIdx < features.length; featureIdx++) {
      let speed = features[featureIdx].properties.speed;
      let pointList = features[featureIdx].geometry.coordinates[0];
      for (let pointIdx=0; pointIdx < pointList.length; pointIdx++) {
        polyCorners.push({ lat: pointList[pointIdx][1], lng: pointList[pointIdx][0] });
      }
      speedZones.push({ 
        "speed": speed,
        "polyCorners": polyCorners,
      });
      polyCorners = [];
    }

    return speedZones;
  }

  loadRouteSpeedZones(routeNbr) {
    let me = this;
    
    return new Promise(resolve => {
      this.db.find({
        attachments: true,
        selector: {
          _id: routeNbr
        }
      }).then((res) => {
        let geo = [];
        let zonesAttachment = res.docs[0].speed_zones;
        this.db.getAttachment(routeNbr, zonesAttachment)
        .then((blob) => {
          var reader = new FileReader();
          reader.onload = () => {
            geo = JSON.parse(reader.result);
            let zoneCoords = me.extractSpeedZoneCoords(geo);
            resolve(zoneCoords);
          }
          reader.readAsText(blob);
        })
        .catch ((err) => {
            this.sharedData.presentBasicAlert("Error", "Unable to read speed zones " + zonesAttachment + ", " + err)
        });
      }).catch((err) => { 
        console.log('Error getting' + routeNbr)
      });
    })
  }

  loadRouteNames() {

    this.db.find({
      attachments: true,
      selector: {
        _id: 'routes'
      }
    }).then((res) => {
      this.sharedData.routes = res.docs[0].routeList;
    })
    .catch ((err) => {
        this.sharedData.presentBasicAlert("Error", "Unable to read route list, " + err)
    });
  }
}
