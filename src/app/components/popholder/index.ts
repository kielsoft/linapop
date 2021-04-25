import { Component, Input, ElementRef, OnInit, AfterViewInit, ViewChild, ViewRef, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, OnDestroy, NgZone, platformCore } from '@angular/core';
import { AbsoluteLayout, Observable, Screen, isAndroid, Dialogs, Color } from '@nativescript/core';
import { AnimationCurve } from '@nativescript/core/ui/enums';
// import { AbsoluteLayout } from "ui/layouts/absolute-layout"

// import { Observable, EventData } from "data/observable";
// import { AnimationCurve } from "ui/enums";
// import { Color } from "color";
// import * as timer from "timer";
// import dialogs = require("ui/dialogs");
// import { ProxyViewContainer } from "ui/proxy-view-container";
// import { View } from "ui/core/view";
// import { ViewBase } from "ui/core/view-base";
// import { StackLayout } from "ui/layouts/stack-layout";

import * as explosion from "nativescript-explosionfield";

import { PopHostDirective } from '../../directives/pop-host';
import { PopComponent } from '../pop';


const INIT_POP_MOVE_UP_DISTANCE: number = 200;

(function () {
	if (typeof (<any>Object).id == "undefined") {
		var id = 0;

		(<any>Object).id = function (o) {
			if (typeof o.__uniqueid == "undefined") {
				Object.defineProperty(o, "__uniqueid", {
					value: ++id,
					enumerable: false,
					// This could go either way, depending on your 
					// interpretation of what an "id" is
					writable: false
				});
			}

			return o.__uniqueid;
		};
	}
})();

@Component({
	selector: 'popholder',
	templateUrl: './template.html',
	styleUrls: ['./style.scss']
})

export class PopHolderComponent implements OnInit {

	@ViewChild("popsHolder", { static: true }) _popsHolder: ElementRef;
	popsHolder: AbsoluteLayout;
	@ViewChild(PopHostDirective, {static: true}) _popHost: PopHostDirective;

	viewContainerRef: ViewContainerRef;
	componentFactory: ComponentFactory<PopComponent>;

	generatorTimer: number;

	playTicker: Observable;

	gameLevel: number = 1;
	popUncaughtCount: number = 0;
	popCaughtCount: number = 0;
	popPerLevel: number = 20;
	popMoveUpDistance: number;
	popMoveUpDistancePerLevel: number = 10;
	sliderMinimum: number = -20;
	sliderMaximum: number = 20;
	sliderValue: number = 0;

	isPlaying: Boolean = false;
	popsStore: Array<any> = new Array();
	popsPlayStore = {};


	popClasses = [
		"red", "green", "blue", "purple", "pink", "color-bomb", "yellow", "mickey", "sofia", "turtle", "cartoon-bomb",
		"red", "green", "all-bomb", "purple", "pink", "orange", "yellow", "mickey", "sofia", "turtle", "speed-limiter",
	];

	constructor(private _componentFactoryResolver: ComponentFactoryResolver, private ngZone: NgZone) {
		this.popMoveUpDistance = INIT_POP_MOVE_UP_DISTANCE;
		this.playTicker = new Observable();
		this.playTicker.set("tick", 0);
	}

	ngOnInit() {
		this.popsHolder = <AbsoluteLayout>this._popsHolder.nativeElement;
		this.componentFactory = this._componentFactoryResolver.resolveComponentFactory(PopComponent);
		this.viewContainerRef = this._popHost.viewContainerRef;
        this.viewContainerRef.clear();
		this.startLoop();
	}

	addPop() {

		if (this.popsStore.length) {

			let pop = <PopComponent>this.popsStore.shift();
			this.popsPlayStore["pop" + pop.indexInField] = pop;

			pop.holderHeight = Number(this.popsHolder.getMeasuredHeight()) / Screen.mainScreen.scale;
			pop.holderWidth = Number(this.popsHolder.getMeasuredWidth()) / Screen.mainScreen.scale;
			pop.resetOnView();

			pop.pop.translateX = Math.random() * ((pop.holderWidth - 150) - 20) + 20;

			pop.pop.animate({
				opacity: 1,
				// backgroundColor: ((<Color>pop.pop.backgroundColor).hex == new Color('red').hex) ? new Color('orange') : new Color('red'),
				duration: 1000,
				curve: AnimationCurve.linear
			}).then(() => {
				pop.canPlay = true;
			});

		} else {
			let componentRef = this.viewContainerRef.createComponent(this.componentFactory);
			let pop: PopComponent = <PopComponent>componentRef.instance;

			pop.indexInField = (<any>Object).id(pop);
			this.popsPlayStore["pop" + pop.indexInField] = pop;
			pop.holderHeight = Number(this.popsHolder.getMeasuredHeight()) / Screen.mainScreen.scale;
			pop.holderWidth = Number(this.popsHolder.getMeasuredWidth()) / Screen.mainScreen.scale;
			pop.popClass = this.setRandonClass();
			pop.popHolder = this;

			pop.destroyer = (canDestroyOthers: Boolean = false) => {
				this.ngZone.run(() => {
					pop.canPlay = false;
					if (canDestroyOthers) {
						var splitted = pop.popClass.split("-", 3);
						if (splitted && splitted[2] == "bomb") {
							this.bumpShowingPops(splitted[1], true)
						}
					}
				});
				setTimeout(() => {
					if (isAndroid) {
						pop.pop.android.setScaleX(1);
						pop.pop.android.setScaleY(1);
					}
					pop.pop.translateY = 0;
					delete this.popsPlayStore["pop" + pop.indexInField];
					this.popsStore.push(pop);
				}, 2000)
			};
		}
	}

	startLoop() {
		this.isPlaying = true;
		this.generatorTimer = setInterval(() => {
			//console.log(`${this.popUncaughtCount} - ${this.popCaughtCount} - ${this.popMoveUpDistance} - ${this.gameLevel} - ${platform.screen.mainScreen.scale} - ${this.popsStore.length}`);

			if (this.popUncaughtCount + this.popCaughtCount < this.popPerLevel) {
				this.sliderMaximum = this.popPerLevel;
				this.sliderMinimum = this.popPerLevel * -1;
			} else {
				this.sliderMaximum = (this.popUncaughtCount > this.popCaughtCount) ? this.popUncaughtCount + this.popPerLevel : this.popCaughtCount + this.popPerLevel
				this.sliderMinimum = this.sliderMaximum * -1;
			}
			this.sliderValue = this.popCaughtCount - this.popUncaughtCount;

			if (this.popUncaughtCount - this.popCaughtCount >= this.popPerLevel) {
				var endMessage = `Total Caught: ${this.popCaughtCount}\nTotal Uncaught: ${this.popUncaughtCount}\n\nLevel:  ${this.gameLevel}`;
				this.isPlaying = false;
				clearInterval(this.generatorTimer);
				this.popUncaughtCount = 0;
				this.popCaughtCount = 0;
				this.gameLevel = 1;
				this.popMoveUpDistance = INIT_POP_MOVE_UP_DISTANCE;

				this.bumpShowingPops();

				Dialogs.confirm({
					title: "Game Over",
					message: endMessage,
					okButtonText: "Donate",
					cancelButtonText: "Play Again",
				}).then(result => {
					// result argument is boolean
					this.startLoop();
				});


				//this.viewContainerRef.clear();
			}
			else if (parseInt((this.popCaughtCount / this.popPerLevel).toString()) > this.gameLevel - 1) {
				this.gameLevel++;

				if (true) {

				} else {

				}
				this.popMoveUpDistance += this.popMoveUpDistancePerLevel;
			}
			else if (this.isPlaying) {
				this.playTicker.set("tick", (Number(this.playTicker.get("tick")) > 1) ? 1 : 2);
				for (var i = 0; i < parseInt((this.gameLevel / 5 + 1).toString()); i++) {
					this.addPop();
				}
			}
		}, 1000) as any;
	}

	bumpShowingPops(group: string = "all", addToScore: Boolean = false) {
		Object.keys(this.popsPlayStore).forEach((popKey) => {
			var pop: PopComponent = this.popsPlayStore[popKey];
			if (pop && pop.canPlay) {
				if (!group || group == 'all') {
					//console.log(`${pop.pop.className} - ${pop.indexInField} - ${pop.canPlay}`);
					explosion.explode(pop.pop);
					pop.destroyer();
					if (addToScore) this.popCaughtCount++;
				}
				else if (group == "cartoon") {
					if (["pop-mickey", "pop-sofia", "pop-turtle"].includes(pop.pop.className)) {
						explosion.explode(pop.pop);
						pop.destroyer();
						if (addToScore) this.popCaughtCount++;
					}
				}
				else if (group == "color") {
					if (["pop-red", "pop-green", "pop-blue", "pop-purple", "pop-pink", "pop-orange", "pop-yellow"].includes(pop.pop.className)) {
						explosion.explode(pop.pop);
						pop.destroyer();
						if (addToScore) this.popCaughtCount++;
					}
				}
				else if (group == pop.pop.className) {
					explosion.explode(pop.pop);
					pop.destroyer();
					if (addToScore) this.popCaughtCount++;
				}
			}
		})
	}

	setRandonClass() {
		var popClass = this.popClasses[Math.floor(Math.random() * this.popClasses.length)];
		if (popClass == 'speed-limiter') {

		}
		return 'pop-' + popClass;
	}
}