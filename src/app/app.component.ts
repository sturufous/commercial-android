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
      this.rootPage = 'TabsPage';
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
}
