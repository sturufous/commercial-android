import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ShareProvider } from '../providers/share/share';

@Component({
  templateUrl: 'app.html'
})


export class MyApp {

  @ViewChild(Nav) nav: Nav;
  rootPage: any;

  constructor(
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    public sharedData: ShareProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.rootPage = 'LoginPage';
      statusBar.styleDefault();
    })
    .catch((e) => console.log("Error on platform ready"));
  }

  openPage(p) {
    console.log("Active page = " + this.sharedData.activeMenuPage);
    if (this.sharedData.activeMenuPage != '') {
      this.nav.pop().then(() => {
        this.nav.push(p);
        this.sharedData.activeMenuPage = p;
      }
    )} else {
      this.nav.push(p);
      this.sharedData.activeMenuPage = p;   
    }
  }

  checkActive(p) {
    if (this.sharedData.activeMenuPage == p) {
      return true;
    } else {
      return false;
    }
  }

  logout() {
    this.sharedData.detailsTabEnabled = false;
    this.sharedData.examinationTabEnabled = false;
    this.sharedData.pretripTabEnabled = false;

    /* this.sharedData.currentExam = this.sharedData.examDefaults;
    this.sharedData.examRevision = '';
    this.sharedData.licenseClass = ''; 

    this.sharedData.leftTurn = {infractions: [], notes:''};
    this.sharedData.rightTurn = {infractions: [], notes:''};
    this.sharedData.roadPosition = {infractions: [], notes:''};
    this.sharedData.speed = {infractions: [], notes:''};
    this.sharedData.backing = {infractions: [], notes:''};
    this.sharedData.shifting = {infractions: [], notes:''};
    this.sharedData.rightOfWay = {infractions: [], notes:''};
    this.sharedData.uncoupling = {infractions: [], notes:''};
    this.sharedData.coupling = {infractions: [], notes:''};

    this.sharedData.coupling.routes = [];
    this.sharedData.coupling.examLoadedFromDB = null; */

    // May need more initializations, but for now assuming the HomePage.openExam() and HomePage.createExam() will do it.

    this.nav.setRoot('LoginPage');
  }
}
