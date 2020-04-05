import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private authStatusSubscription: Subscription;
  isLoading = false;
  spinnerDiameter: number;
  @ViewChild('spinnerDiv') spinnerDiv: ElementRef;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Stop loading once the response is received
    this.authStatusSubscription = this.authService.getAuthStatusListener().subscribe((authStatus) => {
      this.isLoading = false;
    });
  }

  ngAfterViewInit() {
    // Set the spinner diameter to the login button height
    this.spinnerDiameter = this.spinnerDiv.nativeElement.offsetHeight;
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;

    this.authService.login(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSubscription.unsubscribe();
  }
}
