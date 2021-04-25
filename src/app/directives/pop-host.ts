import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[popHost]',
})
export class PopHostDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}