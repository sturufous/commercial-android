import { Component, ViewChildren, ViewChild, ApplicationRef, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Content, LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';
import { CommercialDbProvider } from '../../providers/commercial-db/commercial-db';
import { ActionSheetController } from 'ionic-angular';
import { CanvasDrawComponent } from '../../components/canvas-draw/canvas-draw';
import { GoogleMaps, GoogleMap, VisibleRegion, GoogleMapOptions, GoogleMapsEvent, HtmlInfoWindow, Marker, Polyline, PolylineOptions, ILatLng } from '@ionic-native/google-maps';
import { TextToSpeech } from '@ionic-native/text-to-speech';

/**
 * Generated class for the ExaminationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  priority: 'high'
})
@Component({
  selector: 'page-examination',
  templateUrl: 'examination.html',
})
export class ExaminationPage {

  @ViewChildren(CanvasDrawComponent) canvases;
  @ViewChild(Content) content: Content;
  @ViewChild('speed') speedLimitSign: ElementRef;
  @ViewChild('speedlimit') speedLimitText: ElementRef;
  
  subscription;
  position: any = {
    latitude: '0',
    longitude: '0',
    accuracy: '0',
    altitude: '0',
    altitudeAccuracy: '0',
    speed: '0',
    heading: '0',
    activity: '0',
    speedLimit: '?',
    odometer: '0'
  }

  myClass: any = 'bad';
  showLocation: boolean = false;
  commentArray: any = [];
  typedComments = false;

  alertCtrl: AlertController;
  public sharedData: ShareProvider;
  public dbProvider: CommercialDbProvider;
  public map: GoogleMap;
  public line: Polyline = null;
  public routeGuide: Polyline = null;
  public routeGuideVisible: boolean = true;
  currentLoc: Marker;
  routeSpeedZones: any = null;
  speedZonePolygons: any[] = [];
  speedZoneMarkers: any[] = [];
  zonePolygonsVisible = false;

  VICTORIA_BC = {"lat": 48.4238642, "lng": -123.36846639};

  options: PolylineOptions = {
    points: [this.VICTORIA_BC],
    color: '#3c7afc',
    width: 10,
    geodesic: true,
    zoom: true,
    visible: true,
    strokeOpacity: 1.0
  };

  lineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 4
  };

  routeGuideOptions: PolylineOptions = {
    points: [],
    color: '#9354f2',
    width: 10,
    geodesic: true,
    zoom: true,
    strokeOpacity: 0
  };

  private bgGeo: any;
  heartbeatFlag: boolean = false; // Prevents capture of lat/lng on heartbeat

  accuratePos: any = {
    latitude: 0,
    longitude: 0
  };

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public actionSheet: ActionSheetController,
              alertCtrl: AlertController,
              shareProvider: ShareProvider,
              dbProvider: CommercialDbProvider,
              public platform: Platform,
              public applicationRef: ApplicationRef,
              public tts: TextToSpeech
            ) {
    this.alertCtrl = alertCtrl;
    this.sharedData = shareProvider;
    this.dbProvider = dbProvider;
    platform.ready().then(this.configureBackgroundGeolocation.bind(this));
  }

  configureBackgroundGeolocation() {
    // 1. Get a reference to the plugin
    this.bgGeo = (<any>window).BackgroundGeolocation;

    // 2. Listen to events
    this.bgGeo.on('location', this.onLocation.bind(this));
    this.bgGeo.on('motionchange', this.onMotionChange.bind(this));
    this.bgGeo.on('activitychange', this.onActivityChange.bind(this));
    this.bgGeo.on('geofence', this.onGeofence.bind(this));
    this.bgGeo.on('http', this.onHttpSuccess.bind(this), this.onHttpFailure.bind(this));

    // 3. Configure it.
    this.bgGeo.configure({
      debug: this.sharedData.getGpsDebugFlag(),
      desiredAccuracy: 0,
      distanceFilter: 1,
      autoSync: true,
      stopOnTerminate: true,
      heartbeatInterval: 1
    }, (state) => {
      // 4. Start the plugin.
      this.bgGeo.setOdometer(0).then((location) => {
        console.log('- setOdometer success: ', location);
      })
      .catch ((e) => {
        console.log('- setOdometer Error: ', e);
      });

      // Set timer to get current location on heartbeat every five seconds
      setInterval(() => {
        this.heartbeatFlag = true;
        this.bgGeo.getCurrentPosition().then(location => {
          console.log('- heartbeat. Will trigger onLocation()');
        }).catch(error => {
          console.log('- location error: ', error);
        });
      }, this.sharedData.getUpdateInterval());
      this.bgGeo.start();
    })
  }

  // Is the current location within the polygon described by polyCorners?
  pointInPolygon(point, polyCorners) {

    let i = 0; 
    let j = polyCorners.length - 1;
    let oddNodes = false;
  
    for (i=0; i < polyCorners.length; i++) {
      if (polyCorners[i].lat < point.lat && polyCorners[j].lat >= point.lat
      ||  polyCorners[j].lat < point.lat && polyCorners[i].lat >= point.lat) {
        if (polyCorners[i].lng + (point.lat - polyCorners[i].lat)/(polyCorners[j].lat - polyCorners[i].lat) * (polyCorners[j].lng - polyCorners[i].lng) < point.lng) {
          oddNodes=!oddNodes; }
      }
      j=i; 
    }
  
    return oddNodes; 
  }
  
  onLocation(position, taskId) {

    let currentLoc = {lat: position.coords.latitude, lng: position.coords.longitude };
    let inThisZone = false;

    // Set camera to initial location
    if (this.sharedData.trackingIsOn) {
      this.map.moveCamera({ 
        target: currentLoc
      });
    }

    // Check to see if we are in a speed zone. If we are, set the speed limit
    this.position.speedLimit = '?';
    if (typeof this.routeSpeedZones != 'undefined' && this.routeSpeedZones !== null) {
      for (let zoneIdx=0; zoneIdx < this.routeSpeedZones.length; zoneIdx++) {
        inThisZone = this.pointInPolygon(currentLoc, this.routeSpeedZones[zoneIdx].polyCorners);
        if (inThisZone) {
          this.position.speedLimit = this.routeSpeedZones[zoneIdx].speed;
          break;
        }
      }
    }

    if (this.position.speedLimit != '?') {
      this.speedLimitSign.nativeElement.src = this.getSpeedZoneImageURL(this.position.speedLimit);
    } else {
      this.speedLimitSign.nativeElement.src = 'assets/imgs/xkmh.png';
    }

    // Move current location marker to new position
    if (!this.sharedData.routeWasLoaded) {
      this.currentLoc.setPosition({lat: position.coords.latitude, lng: position.coords.longitude});
    }

    console.log('- location: ' + position + ', taskid = ' + taskId);
    this.accuratePos.latitude = position.coords.latitude != null ? position.coords.latitude : '0';
    this.accuratePos.longitude = position.coords.longitude != null ? position.coords.longitude : '0';
    this.position.accuracy = position.coords.accuracy != null ? position.coords.accuracy : '0';
    this.position.altitude = position.coords.altitude != null ? position.coords.altitude : '0';
    this.position.altitudeAccuracy = position.coords.altitudeAccuracy != null ? position.coords.altitudeAccuracy : '0';
    this.position.speed = position.coords.speed > 0 ? this.convMetresPerSecondToKmh(position.coords.speed) : '0';
    this.position.heading = position.coords.heading != null ? position.coords.heading : '0';
    this.position.activity = position.activity.type != null ? position.activity.type : '0';
    this.position.odometer = position.odometer != null ? position.odometer : '0';

    this.position.latitude = this.accuratePos.latitude.toString().substr(0, 9);
    this.position.longitude = this.accuratePos.longitude.toString().substr(0, 9);
    this.position.altitude = this.position.altitude.toString().substr(0, 9);
    this.position.accuracy = this.position.accuracy.toString().substr(0, 9);

    if (this.position.speedLimit != '?') {
      let speedThreshold = eval(this.position.speedLimit + " + " + this.sharedData.userProfile.speedMargin);
      if (this.position.speed > speedThreshold) {
        this.speedLimitText.nativeElement.style.color = 'red';
        this.speedLimitText.nativeElement.style.fontWeight = 'bold';
        this.applicationRef.tick(); // Ensure display updates immediately
    
        if (this.sharedData.userProfile.soundNotifications) {
          this.tts.speak('Slow down')
          .then(() => console.log('Said slow down'))
          .catch((reason: any) => console.log(reason));
        }
      } else {
        this.speedLimitText.nativeElement.style.color = '#6c6c6c';
        this.speedLimitText.nativeElement.style.fontWeight = 'normal';
      }
    } else {
      this.speedLimitText.nativeElement.style.color = '#6c6c6c';
      this.speedLimitText.nativeElement.style.fontWeight = 'normal';
    }

    // Don't store points for every heartbeat or if route was loaded from the db
    if (!this.sharedData.routeWasLoaded && !this.heartbeatFlag) { 
      this.sharedData.gpsData.push({ lat: position.coords.latitude, lng: position.coords.longitude});
      if (this.line !== null) {
        this.line.setPoints(this.sharedData.gpsData);
        this.sharedData.gpsView = JSON.stringify(this.sharedData.gpsData);
      }
    }
    this.bgGeo.finish(taskId);
    this.applicationRef.tick();
    this.heartbeatFlag = false;
  };

  onMotionChange(isMoving, location, taskId) {
    console.log('- motionchange: ', isMoving, location);
    this.bgGeo.finish(taskId);
  }

  onActivityChange(activity) {
    console.log('- activitychange: ', activity);
  }

  onGeofence(params, taskId) {
    console.log('- geofence: ', params);
    this.bgGeo.finish(taskId);
  }

  onHttpSuccess(response) {
    console.log('- http success: ', response);
  }

  onHttpFailure(response) {
    console.log('- http failure: ', response);
  }
  
  convMetresPerSecondToKmh(speed) {
    return speed * 3.6;
  }

  getSpeedZoneImageURL(speedLimit) {
    return 'assets/imgs/' + speedLimit + '0kmh.png'
  }

  deleteInfraction(infraction, infractions) {
    var index = this.indexByTime(infraction, infractions);
    if (index > -1) {
        infractions.splice(index, 1);
    }
  }

  indexByTime(childArray, parentArray) {
    let index: any = -1;
    for (let idx = 0; idx < parentArray.length; idx++) {
      if (parentArray[idx].time == childArray.time) {
        index = idx;
        break;
      }
    }
    return index;
  }

  presentLeftTurn() {

    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
        title: 'LEFT TURN',
        inputs: [
          {
            name: 'steering',
            type: 'radio',
            label: 'Steering',
            value: 'Steering#5',
            checked: false
          },
          {
            name: 'improper-turn',
            type: 'radio',
            label: 'Improper Turn - cut/wide/setup',
            value: 'Improper Turn#10',
            checked: false
          },
          {
            name: 'wrong-lane',
            type: 'radio',
            label: 'Ends in wrong lane',
            value: 'Wrong Lane#10',
            checked: false
          },
          {
            name: 'observation',
            type: 'radio',
            label: 'Observation before/during turn',
            value: 'Observation#10',
            checked: false
          },
          {
            name: 'signal',
            type: 'radio',
            label: 'Signal - timing/no/cancel',
            value: 'Signal#10',
            checked: false
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Ok',
            handler: data => {
              if (data != null) {
                this.sharedData.leftTurn.infractions.push(this.getDemeritObject(data, this.sharedData.leftTurn, 'Left Turn', 'left-turn'));          
                console.log("Left turn = " + JSON.stringify(this.sharedData.leftTurn));
                return true;
              }
            },
            role: 'submit'
          }
        ]});
      alert.present();
    }
  }

  presentRightTurn() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'RIGHT TURN',
      inputs: [
        {
          name: 'steering',
          type: 'radio',
          label: 'Steering',
          value: 'Steering#5',
          checked: false
        },
        {
          name: 'improper-turn',
          type: 'radio',
          label: 'Improper Turn - cut/wide/setup',
          value: 'Improper Turn#5',
          checked: false
        },
        {
          name: 'wrong-lane',
          type: 'radio',
          label: 'Ends in wrong lane',
          value: 'Wrong-lane#10',
          checked: false
        },
        {
          name: 'observation',
          type: 'radio',
          label: 'Observation before/during turn',
          value: 'Observation#10',
          checked: false
        },
        {
          name: 'signal',
          type: 'radio',
          label: 'Signal - timing/no/cancel',
          value: 'Signal#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.rightTurn.infractions.push(this.getDemeritObject(data, this.sharedData.rightTurn, 'Right Turn', 'right-turn'));
              console.log("Right turn = " + JSON.stringify(this.sharedData.rightTurn));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  presentRoadPosition() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'ROAD POSITION',
      inputs: [
        {
          name: 'too-far-over',
          type: 'radio',
          label: 'Too far left/right',
          value: 'Too Far Over#5',
          checked: false
        },
        {
          name: 'steering',
          type: 'radio',
          label: 'Steering',
          value: 'Steering#5',
          checked: false
        },
        {
          name: 'lane-selection',
          type: 'radio',
          label: 'Lane Selection',
          value: 'Lane Selection#5',
          checked: false
        },
        {
          name: 'too-far-ahead-back',
          type: 'radio',
          label: 'Stops too far ahead/back',
          value: 'Too Far Ahead/Back#5',
          checked: false
        },
        {
          name: 'parking',
          type: 'radio',
          label: 'Parking',
          value: 'Parking#5',
          checked: false
        },
        {
          name: 'conditions-mirrors',
          type: 'radio',
          label: 'Fails to observe conditions/mirrors',
          value: 'Conditions/Mirror#10',
          checked: false
        },
        {
          name: 'too-close',
          type: 'radio',
          label: 'Follows too close',
          value: 'Too Close#10',
          checked: false
        },
        {
          name: 'lane-change',
          type: 'radio',
          label: 'Lane Change',
          value: 'Lane Change#10',
          checked: false
        },
        {
          name: 'off-track',
          type: 'radio',
          label: 'Off track/straddles',
          value: 'Off Track#10',
          checked: false
        },
        {
          name: 'signal',
          type: 'radio',
          label: 'Signal - timing/no/cancel',
          value: 'Signal#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.roadPosition.infractions.push(this.getDemeritObject(data, this.sharedData.roadPosition,  'Road Position', 'road-position'));
              console.log("Road position = " + JSON.stringify(this.sharedData.roadPosition));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  presentSpeed() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'SPEED',
      inputs: [
        {
          name: 'too-slow',
          type: 'radio',
          label: 'Too slow for conditions',
          value: 'Too Slow#5',
          checked: false
        },
        {
          name: 'uneven-speed',
          type: 'radio',
          label: 'Uneven speed control',
          value: 'Uneven Speed#5',
          checked: false
        },
        {
          name: 'approach-too-fast',
          type: 'radio',
          label: 'Approach too fast',
          value: 'Approach Too Fast#5',
          checked: false
        },
        {
          name: 'improper-braking',
          type: 'radio',
          label: 'Improper use of brake/service/retarder',
          value: 'Improper Braking#5',
          checked: false
        },
        {
          name: 'too-fast',
          type: 'radio',
          label: 'Too fast for conditions',
          value: 'Too Fast#10',
          checked: false
        },
        {
          name: 'rolling-stop',
          type: 'radio',
          label: 'Rolling stop',
          value: 'Rolling Stop#10',
          checked: false
        },
        {
          name: 'amber-light',
          type: 'radio',
          label: 'Amber light',
          value: 'Amber Light#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.speed.infractions.push(this.getDemeritObject(data, this.sharedData.speed,  'Speed', 'speed'));
              console.log("Speed = " + JSON.stringify(this.sharedData.speed));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  presentBacking() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'BACKING',
      inputs: [
        {
          name: 'no-horn',
          type: 'radio',
          label: 'Fails to sound horn',
          value: 'No Horn#5',
          checked: false
        },
        {
          name: 'steering',
          type: 'radio',
          label: 'Steering',
          value: 'Steering#5',
          checked: false
        },
        {
          name: 'walk-around',
          type: 'radio',
          label: 'Fails to walk around before backing/360 degree',
          value: 'No Walk Around#5',
          checked: false
        },
        {
          name: 'poor-observation',
          type: 'radio',
          label: 'Poor observation while backing',
          value: 'Poor Observation#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.backing.infractions.push(this.getDemeritObject(data, this.sharedData.backing,  'Backing', 'backing'));
              console.log("Backing = " + JSON.stringify(this.sharedData.backing));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  presentShifting() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'SHIFTING',
      inputs: [
        {
          name: 'wrong-gear',
          type: 'radio',
          label: 'Wrong gear',
          value: 'Wrong Gear#5',
          checked: false
        },
        {
          name: 'misses-shift',
          type: 'radio',
          label: 'Misses shift',
          value: 'Misses Shift#5',
          checked: false
        },
        {
          name: 'clutch-throttle',
          type: 'radio',
          label: 'Improper use of clutch/throttle',
          value: 'Clutch/Throttle#5',
          checked: false
        },
        {
          name: 'difficulty-recovering',
          type: 'radio',
          label: 'Difficulty recovering shift or coasts',
          value: 'Difficulty Recovering#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.shifting.infractions.push(this.getDemeritObject(data, this.sharedData.shifting,  'Shifting', 'shifting'));
              console.log("Shifting = " + JSON.stringify(this.sharedData.shifting));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  presentRightOfWay() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'RIGHT OF WAY',
      inputs: [
        {
          name: 'uncertain',
          type: 'radio',
          label: 'Uncertain - take/yeald',
          value: 'Uncertain#5',
          checked: false
        },
        {
          name: 'assumes',
          type: 'radio',
          label: 'Assumes',
          value: 'Assumes#10',
          checked: false
        },
        {
          name: 'unnecessary-stop',
          type: 'radio',
          label: 'Stops unnecessarily',
          value: 'Unnecessary Stop#10',
          checked: false
        },
        {
          name: 'fail-to-yield',
          type: 'radio',
          label: 'Fails to yield to vehicle/pedestrian',
          value: 'Fails To Yield#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.rightOfWay.infractions.push(this.getDemeritObject(data, this.sharedData.rightOfWay,  'Right Of Way', 'right-of-way'));
              console.log("Right of way = " + JSON.stringify(this.sharedData.rightOfWay));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  presentUncoupling() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'UNCOUPLING',
      inputs: [
        {
          name: 'uncertain',
          type: 'radio',
          label: 'Uncertain procedure',
          value: 'Uncertain#5',
          checked: false
        },
        {
          name: 'no-brakes-trailer',
          type: 'radio',
          label: 'Brakes not applied/trailer not secured',
          value: 'No Brakes/Trailer Insecure#5',
          checked: false
        },
        {
          name: 'too-far-ahead',
          type: 'radio',
          label: 'Moves tractor too far ahead/clearance',
          value: 'Too Far Ahead#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.uncoupling.infractions.push(this.getDemeritObject(data, this.sharedData.uncoupling, 'Uncoupling', 'uncoupling'));
              console.log("Uncoupling = " + JSON.stringify(this.sharedData.uncoupling));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  presentCoupling() {
    if (!this.sharedData.routeWasLoaded) {
      let alert = this.alertCtrl.create({
      title: 'COUPLING',
      inputs: [
        {
          name: 'uncertain',
          type: 'radio',
          label: 'Uncertain procedure',
          value: 'Uncertain#5',
          checked: false
        },
        {
          name: 'alignment',
          type: 'radio',
          label: 'Align tractor and trailer',
          value: 'Alignment#5',
          checked: false
        },
        {
          name: 'visual-inspection',
          type: 'radio',
          label: 'Visual inspection of jaws/hitch',
          value: 'Visual Inspection#10',
          checked: false
        },
        {
          name: 'proper-height',
          type: 'radio',
          label: 'Proper height/alignment/landing gear',
          value: 'Proper Heightt#10',
          checked: false
        },
        {
          name: 'tug-test',
          type: 'radio',
          label: 'Tug test not complete',
          value: 'Tug Test#10',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: data => {
            if (data != null) {
              this.sharedData.coupling.infractions.push(this.getDemeritObject(data, this.sharedData.coupling,  'Coupling', 'coupling'));
              console.log("Coupling = " + JSON.stringify(this.sharedData.coupling));
              return true;
            }
          },
          role: 'submit'
        }
      ]});
      alert.present();
    }
  }

  formatDemeritMessage(demeritObject) {
    let dt = new Date(demeritObject.time).toISOString(); 
    let date: any = ''; 
    let time: any = '';
    let dateArray = dt.split('T');

    date = dateArray[0];
    time = dateArray[1].substring(0, 8);

    let message = 
      '<table>' +
      '<tr><td>Date:&nbsp;</td><td style="white-space: nowrap">' + date + '</td></tr>' +
      '<tr><td>Time:&nbsp;</td><td style="white-space: nowrap">' + time + '</td></tr>' +
      '<tr><td>Demerits:&nbsp;</td><td>' + demeritObject.demerits + ' Points</td></tr>' +
      '<tr><td>Latitude:&nbsp;</td><td>' + demeritObject.latitude + '</td></tr>' +
      '<tr><td>Longitude:&nbsp;</td><td>' + demeritObject.longitude + '</td></tr>' +
      '<tr><td>Altitude:&nbsp;</td><td>' + demeritObject.altitude + '</td></tr>' +
      '<tr><td>Odometer:&nbsp;</td><td>' + demeritObject.odometer + '</td></tr>' +
      '<tr><td>Speed:&nbsp;</td><td>' + demeritObject.speed + '</td></tr>' +
      '</table>';

    return message;
  }

  presentDemerits(demeritObject) {
    let msg: any = this.formatDemeritMessage(demeritObject);
    let alert = this.alertCtrl.create({
      title: 'DRIVING INCIDENT',
      subTitle: demeritObject.value,
      message: msg,
      buttons: ['Dismiss']
    });
    alert.present();
  }

  getDemeritObject(data, arr, desc, icon) {

    if (data !== undefined) {
      let delimLoc = data.indexOf('#');
      let description = data.substring(0, delimLoc);
      let demerits = data.substring(delimLoc+1, data.length);
      let currTime = new Date();

      let demeritData = {
        value: description,
        time: currTime,
        demerits: demerits,
        latitude: this.accuratePos.latitude,
        longitude: this.accuratePos.longitude,
        altitude: this.position.altitude,
        odometer: this.position.odometer,
        speed: this.position.speed
      };

      let marker: Marker = this.map.addMarkerSync({
        icon: {
          url: 'assets/imgs/' + icon + '.png',
          size: {
            width: 45,
            height: 45
          }
        },
        animation: 'DROP',
        position: {
          lat: this.accuratePos.latitude,
          lng: this.accuratePos.longitude
        }
      });

      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        var htmlInfoWindow = new HtmlInfoWindow();
        let msg = this.formatDemeritMessage(demeritData);
        htmlInfoWindow.setContent(
          '<div style="padding:10px">' +
            '<div style="border-bottom: 1px solid #AAA;margin-bottom: 7px">' +
              '<span class="iw-header">' +
                '<b>' + desc + '</b><br>'  +
              '</span>' + 
              '<span class="iw-subheader">' + 
                demeritData.value +
              '</span>' +
            '</div>' +
              msg + 
          '</div>');
        htmlInfoWindow.open(marker);
      });

      return {
        value: description, 
        time: currTime, 
        demerits: demerits, 
        latitude: this.accuratePos.latitude, 
        longitude: this.accuratePos.longitude,
        altitude: this.position.altitude,
        odometer: this.position.odometer,
        speed: this.position.speed
      }
    } 

    return null;
  }

  saveCurrentExam() {
    if (this.sharedData.prepareCurrentExam().valid) {
      this.dbProvider.updateExam();
    }
  }

  // TODO: Clean up comment array use, should there be a copy here and in sharedData?
  // Also, does the array have to be instantiated each time we run this?
  showAttachmentIcon(index) {
    if (typeof this.commentArray[index] != 'undefined') {
      return this.commentArray[index].wasLoaded;
    };

    return true;
  }

  loadMap() {
     
    let mapOptions: GoogleMapOptions = {
      'controls': {
        'compass': true,
        'myLocationButton': true,
        'indoorPicker': true,
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      },
      'camera': {
        target: this.VICTORIA_BC,
        zoom: 18,
        tilt: 30
      }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);
  }

  ionViewDidLoad() {
    this.sharedData.examinationCanvases = this.canvases;
    this.commentArray = this.sharedData.examinationCanvases.toArray();
    this.loadMap();

    // Initialize all canvas elements to blank backgrounds    
    for (let canvasIdx=0; canvasIdx < this.commentArray.length; canvasIdx++) {
      this.commentArray[canvasIdx].drawBackground();
    }
  }

  showPolygon() {

    let currentPolygon: any = null;
    let currentLimit: string = null;
    let imgUrl: string = null;
    
    if (this.speedZonePolygons.length == 0) {
      for (let zoneIdx=0; zoneIdx < this.routeSpeedZones.length; zoneIdx++) {
        currentPolygon = this.map.addPolygonSync({
          'points': this.routeSpeedZones[zoneIdx].polyCorners,
          'strokeColor' : 'red',
          'strokeWidth': 2,
          'fillColor': 'rgba(255, 0, 0, 0.3)'
        });
        this.speedZonePolygons.push(currentPolygon);

        currentLimit = this.routeSpeedZones[zoneIdx].speed;
        imgUrl = this.getSpeedZoneImageURL(currentLimit);

        let markerPos = this.compute2DPolygonCentroid(this.routeSpeedZones[zoneIdx].polyCorners);

        let marker: Marker = this.map.addMarkerSync({
          icon: {
            url: imgUrl,
            size: {
              width: 30,
              height: 45
            }
          },
          animation: 'DROP',
          position: markerPos
        }); 
        
        this.speedZoneMarkers.push(marker);
      }
    } else {

      for (let zoneIdx=0; zoneIdx < this.speedZonePolygons.length; zoneIdx++){
        this.speedZonePolygons[zoneIdx].setVisible(this.zonePolygonsVisible);
        this.speedZoneMarkers[zoneIdx].setVisible(this.zonePolygonsVisible);
      }
      
      this.zonePolygonsVisible = !this.zonePolygonsVisible;
    }
  }

  ionViewDidEnter() {
    this.map.clear();
    this.sharedData.examinationPage = this;
    this.sharedData.readExamAttachments(this.dbProvider);
    this.sharedData.drawingToggle = false;
    this.speedZonePolygons = [];
    this.speedZoneMarkers = [];

    if (!this.sharedData.routeWasLoaded) { // Actual exam route already saved
      // My first promise implementation, so excited it solved my async problems!
      let route = this.sharedData.examiner.getRawValue().route;

      if (route != '') {
        this.dbProvider.loadExamRouteCoords(route)
        .then((routeCoords) => {
          this.routeGuideOptions.points = <ILatLng[]>routeCoords;
          this.routeGuide = this.map.addPolylineSync(this.routeGuideOptions);

          this.line = this.map.addPolylineSync(this.options);

          let marker: Marker = this.map.addMarkerSync({
            icon: {
              url: 'assets/imgs/' + this.sharedData.examiner.getRawValue().route + '.png',
              size: {
                width: 85,
                height: 32
              }
            },
            animation: 'DROP',
            position: {
              lat: routeCoords[0].lat,
              lng: routeCoords[0].lng
            }
          });
    
          this.currentLoc = this.map.addMarkerSync({
            icon: {
              url: 'assets/imgs/current-loc.png',
              size: {
                width: 25,
                height: 25
              }
            },
            animation: 'DROP',
            position: {
              lat: this.position.latitude,
              lng: this.position.longitude
            }
          });
        })
      }

      this.dbProvider.loadRouteSpeedZones(route)
      .then((speedZones) => {
        this.routeSpeedZones = speedZones;
      });
    } else {
        this.map.clear();
        this.line = this.map.addPolylineSync(this.options);
        this.line.setPoints(this.sharedData.gpsData);

        this.plotInfractionMarkers(this.sharedData.leftTurn, 'Left Turn', 'left-turn');
        this.plotInfractionMarkers(this.sharedData.rightTurn, 'Right Turn', 'right-turn');
        this.plotInfractionMarkers(this.sharedData.roadPosition, 'Road Position', 'road-position');
        this.plotInfractionMarkers(this.sharedData.speed, 'Speed', 'speed');
        this.plotInfractionMarkers(this.sharedData.backing, 'Backing', 'backing');
        this.plotInfractionMarkers(this.sharedData.shifting, 'Shifting', 'shifting');
        this.plotInfractionMarkers(this.sharedData.rightOfWay, 'Right Of Way', 'right-of-way');
        this.plotInfractionMarkers(this.sharedData.uncoupling, 'Uncoupline', 'uncoupling');
        this.plotInfractionMarkers(this.sharedData.coupling, 'Coupling', 'coupling');
      }
    console.log('ionViewDidLoad ExaminationPage');
  }

  ionViewDidLeave() {
    //this.bgGeo.stop();
  }

  plotInfractionMarkers(infraction, desc, icon) {

    for (let idx=0; idx < infraction.infractions.length; idx++) {
      let marker: Marker = this.map.addMarkerSync({
        icon: {
          url: 'assets/imgs/' + icon + '.png',
          size: {
            width: 45,
            height: 45
          }
        },
        animation: 'DROP',
        position: {
          lat: infraction.infractions[idx].latitude,
          lng: infraction.infractions[idx].longitude
        }
      });
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        var htmlInfoWindow = new HtmlInfoWindow();
        let msg = this.formatDemeritMessage(infraction.infractions[idx]);
        htmlInfoWindow.setContent(
          '<div style="padding:10px">' +
            '<div style="border-bottom: 1px solid #AAA;margin-bottom: 7px">' +
              '<span class="iw-header">' +
                '<b>' + desc + '</b><br>'  +
              '</span>' + 
              '<span class="iw-subheader">' + 
              infraction.infractions[idx].value +
              '</span>' +
            '</div>' +
             msg + 
          '</div>');
        htmlInfoWindow.open(marker);
      });
    }
  }

  toggleRouteGuide() {
    this.routeGuideVisible = !this.routeGuideVisible;
    this.routeGuide.setVisible(this.routeGuideVisible);
  }

  clearComment(index) {
    this.commentArray[index].drawBackground(null);
    this.commentArray[index].dirty = true;
  }

  toggleComments() {
    this.typedComments = !this.typedComments;
    return this.typedComments;
  }

  toggleMapsCanvas() {
    this.sharedData.showMaps = !this.sharedData.showMaps;
    return this.sharedData.showMaps;
  }

  reloadComment(index) {
    this.sharedData.readSingleCommentAttachment(this.dbProvider, index);
  }

  deleteComment(index) {
    this.sharedData.deleteSingleCommentAttachment(this.dbProvider, index);
    this.commentArray[index].drawBackground(null);
  }

  showGpsStream() {
    JSON.stringify(this.sharedData.gpsData);
  }

  toggleTracking() {
    this.sharedData.trackingIsOn = !this.sharedData.trackingIsOn;
  }

  moveCameraToCurrentLoc() {
    this.map.moveCamera({ 
      target: {lat: this.position.latitude, lng: this.position.longitude }
    })
  }

  moveCameraToCurrentRoute() {
    let routeName = this.sharedData.examiner.getRawValue().route;
    if ( routeName == '') {
      this.sharedData.presentBasicAlert("Error", "Please select a route");
    } else {
      this.map.moveCamera({ 
        target: {lat: this.routeGuideOptions.points[0].lat, lng: this.routeGuideOptions.points[0].lng }
      });
    }
  }

  compute2DPolygonCentroid(polyCorners)
  {
    let centroid = {lat: 0, lng: 0};
    let signedArea = 0.0;
    let x0: number = 0.0; // Current vertex X
    let y0: number = 0.0; // Current vertex Y
    let x1: number = 0.0; // Next vertex X
    let y1: number = 0.0; // Next vertex Y
    let a: number = 0.0;  // Partial signed area

    // For all vertices except last
    for (let cornerIdx=0; cornerIdx < polyCorners.length-1; cornerIdx++)
    {
        x0 = polyCorners[cornerIdx].lng;
        y0 = polyCorners[cornerIdx].lat;
        x1 = polyCorners[cornerIdx+1].lng;
        y1 = polyCorners[cornerIdx+1].lat;
        a = x0*y1 - x1*y0;
        signedArea += a;
        centroid.lng += (x0 + x1)*a;
        centroid.lat += (y0 + y1)*a;
    }

    // Do last vertex separately to avoid performing an expensive
    // modulus operation in each iteration.
    x0 = polyCorners[polyCorners.length-1].lng;
    y0 = polyCorners[polyCorners.length-1].lat;
    x1 = polyCorners[0].lng;
    y1 = polyCorners[0].lat;
    a = x0*y1 - x1*y0;
    signedArea += a;
    centroid.lng += (x0 + x1)*a;
    centroid.lat += (y0 + y1)*a;

    signedArea *= 0.5;
    centroid.lng /= (6.0*signedArea);
    centroid.lat /= (6.0*signedArea);

    return centroid;
  }
}