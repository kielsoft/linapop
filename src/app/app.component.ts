import { AfterContentChecked, Component, OnInit } from "@angular/core";
import { Application, isAndroid } from "@nativescript/core";

@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, AfterContentChecked {

    private androidDecorView: any;

    ngAfterContentChecked() {
        if(isAndroid){
            this.androidDecorView.setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_FULLSCREEN)
        }
    }

    ngOnInit(): void {
        if(isAndroid){
            this.androidDecorView = Application.android.startActivity.getWindow().getDecorView();
        }
    }
 }
