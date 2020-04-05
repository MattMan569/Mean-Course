import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {
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

  async onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;

    if (form.value.password !== form.value.confirmPassword) {
      form.controls.confirmPassword.setErrors({
        passwordMismatch: true,
      });
      return;
    }

    this.authService.createUser(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSubscription.unsubscribe();
  }
}
