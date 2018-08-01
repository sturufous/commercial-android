import { NgModule } from '@angular/core';
import { CanvasDrawComponent } from './canvas-draw/canvas-draw';
import { GraphicToolsPage } from '../pages/graphic-tools/graphic-tools';

@NgModule({
	declarations: [CanvasDrawComponent],
	//mports: [CanvasDrawComponent],
	exports: [CanvasDrawComponent]
})
export class ComponentsModule {}
