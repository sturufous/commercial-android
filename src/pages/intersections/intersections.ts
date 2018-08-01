import { Component, ViewChild, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Slide } from 'ionic-angular';
import { CanvasDrawComponent } from '../../components/canvas-draw/canvas-draw';
import { PopoverController } from 'ionic-angular';
import { GraphicToolsPage } from '../../pages/graphic-tools/graphic-tools';
import { ShareProvider } from '../../providers/share/share';
import { QueryList } from '@angular/core';

/**
 * Generated class for the IntersectionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-intersections',
  templateUrl: 'intersections.html',
})

export class IntersectionsPage {

  @ViewChild('intersectionSlider') slider: Slides;
  @ViewChildren(Slide) sliderKids: QueryList<Slide>;
  @ViewChildren(CanvasDrawComponent) canvasDrawerers: QueryList<CanvasDrawComponent>;
  canvasComp: CanvasDrawComponent;
  drawerers: CanvasDrawComponent[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public popoverCtrl: PopoverController,
    public sharedData: ShareProvider,
    ) {
  }

  ionViewDidLoad() {
    this.slider.lockSwipeToNext(false);
    this.sharedData.drawingToggle = true;
  }

  ionViewDidEnter() {
    this.drawerers = this.canvasDrawerers.toArray();
  }

  lockSlider(lock) {
    this.sharedData.drawingToggle = !lock;
    this.slider.lockSwipes(lock);
  }

  nextSlide() {
    this.slider.slideNext();
  }

  prevSlide() {
    this.slider.slidePrev();
  }

  clearCanvas() {
    let currentSlide = this.slider.getActiveIndex();
    let currentDrawerer = this.drawerers[currentSlide];
    
    currentDrawerer.drawBackground(null);
  }

  presentPopover(myEvent) { 
    let popover = this.popoverCtrl.create('GraphicToolsPage'); 
    popover.present({ ev: myEvent }); 
  } 
}
