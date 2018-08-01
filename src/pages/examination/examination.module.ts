import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExaminationPage } from './examination';
import { ComponentsModule } from '../../components/components.module';
//import { CanvasDrawComponent } from '../../components/canvas-draw/canvas-draw';

@NgModule({
  declarations: [
    ExaminationPage,
  ],
  imports: [
    IonicPageModule.forChild(ExaminationPage),
    ComponentsModule
  ],
  exports: [
    ExaminationPage
  ]
})
export class ExaminationPageModule {}