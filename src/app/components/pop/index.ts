// import { PopHolderComponent } from "../popholder/component"

import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { AbsoluteLayout, Application, Color, EventData, isAndroid, isIOS, Observable, PropertyChangeData, StackLayout } from '@nativescript/core';
import { AnimationCurve } from '@nativescript/core/ui/enums';
import * as explosion from "nativescript-explosionfield";


@Component({
	selector: 'pop',
	templateUrl: './template.html',
	styleUrls: ['./style.scss'],
})

export class PopComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild("bubble", {static: true}) _bubble: ElementRef;
	@Input() holderHeight: number;
	@Input() indexInField: number;
	@Input() holderWidth: number;
	@Input() destroyer: Function;
	@Input() popHolder: any; // PopHolderComponent;
	@Input() popClass: string;

	pop: StackLayout;
	popLabel: string;
	timerId: number;
	canPlay: Boolean = false;

	constructor(private ngZone: NgZone) {

	}

	ngOnInit(): void {
		this.pop = <StackLayout>this._bubble.nativeElement;
		//this.popLabel = "Pop " + this.indexInField;
	}

	ngAfterViewInit() {
		this.pop.addEventListener('tap', (event: EventData) => {
			this.tapped(event);
		})

		this.resetOnView();

		this.pop.className = (this.popClass) ? this.popClass : "pop-red";

		this.canPlay = true;
		this.popHolder.playTicker.addEventListener(Observable.propertyChangeEvent, (pcd: PropertyChangeData) => {
			if (this.canPlay && pcd.propertyName == 'tick' && Number(pcd.value) > 0) {
				this.animate();
			}
		});

	}

	ngOnDestroy() {
		console.log(`${this.popLabel} is dead`);
	}

	resetOnView() {
		AbsoluteLayout.setTop(this.pop, this.holderHeight);
		AbsoluteLayout.setLeft(this.pop, 0);
		this.pop.translateX = Math.random() * ((this.holderWidth - 150) - 20) + 20;
	}

	tapped(event: EventData) {
		this.ngZone.run(() => {
			// this.pop.style.backgroundColor = new Color("blue");
			if (!this.popHolder.isPlaying || !this.canPlay) return;
			this.popHolder.popCaughtCount++;
			this.canPlay = false;
			if (isAndroid) {
				this.pop.animate({
					opacity: 0,
					duration: 300,
					curve: AnimationCurve.easeIn,
				}).then(() => {
					explosion.explode(this.pop);
					this.destroyer(true);
				});
				//explosion.explode(this.pop);
				//this.destroyer();
			} else if (isIOS) {
				this.pop.animate({
					opacity: 0,
					duration: 300,
					curve: AnimationCurve.easeIn,
				}).then(() => {
					this.destroyer(true);
				});
			}
		});
	}

	animate() {
		if (!this.popHolder.isPlaying) return;
		this.ngZone.run(() => {
			if ((this.pop.translateY * -1) >= (Number(this.pop.top) + Number(this.pop.height))) {
				this.canPlay = false;
				this.popHolder.popUncaughtCount++;
				this.destroyer();

			} else {
				if (!this.canPlay) return;
				setTimeout(() => {
					this.pop.animate({
						translate: {
							x: this.pop.translateX - (Math.random() * 50 + (-20)),
							y: this.pop.translateY - parseInt(((Math.random() * (this.popHolder.popMoveUpDistance * 0.5)) + this.popHolder.popMoveUpDistance * 0.5).toString())
						},
						duration: (Math.random() * 300) + 400,
						curve: AnimationCurve.cubicBezier(0.1, 0.1, 0.1, 1)
					});
				}, (Math.random() * 100) + 100);
			}
		});
	}
}
