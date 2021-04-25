
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { NativeScriptCommonModule, NativeScriptRouterModule, NativeScriptFormsModule } from "@nativescript/angular";
import { PopHostDirective } from "../directives/pop-host";
import { PopComponent } from "./pop";
import { PopHolderComponent } from "./popholder";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule,
        NativeScriptFormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        PopHostDirective,
        PopComponent,
        PopHolderComponent,
    ],
    exports: [
        PopComponent,
        PopHolderComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class ComponentsModule { }
