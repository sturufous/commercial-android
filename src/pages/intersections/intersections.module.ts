import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IntersectionsPage } from './intersections';
import { ComponentsModule } from '../../components/components.module';
import { GraphicToolsPage } from '../graphic-tools/graphic-tools';

@NgModule({
  declarations: [
    IntersectionsPage
  ],
  imports: [
    IonicPageModule.forChild(IntersectionsPage),
    ComponentsModule
  ],
  exports: [
    IntersectionsPage
  ]
})
export class IntersectionsPageModule {}
