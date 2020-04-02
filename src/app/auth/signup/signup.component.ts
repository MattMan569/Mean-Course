import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements AfterViewInit {
  isLoading = false;
  spinnerDiameter: number;
  @ViewChild('spinnerDiv') spinnerDiv: ElementRef;

  constructor(private authService: AuthService) { }

  ngAfterViewInit() {
    // Set the spinner diameter to the login button height
    this.spinnerDiameter = this.spinnerDiv.nativeElement.offsetHeight;
  }

  onSignup(form: NgForm) {
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
}
