
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptCommonModule, NativeScriptRouterModule } from "@nativescript/angular";

import { PlayComponent } from "./play";
import { ComponentsModule } from "../../components";
import { PopHostDirective } from "../../directives/pop-host";

const routes: Routes = [
    { path: "play", component: PlayComponent },
];

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule.forChild(routes),
        ComponentsModule
    ],
    declarations: [
        PlayComponent,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class GameModule { }
