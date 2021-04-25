import { Component, OnInit } from "@angular/core";
import { Application, Page } from "@nativescript/core";

@Component({
    selector: "Welcome",
    templateUrl: "./template.html",
    styleUrls: ['./style.scss'],
})
export class PlayComponent implements OnInit {

    constructor(
        private page: Page,
    ) {
        this.page.actionBarHidden = true;
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
    }
}
