import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {
  isLoading = false;
  spinnerDiameter: number;
  @ViewChild('spinnerDiv') spinnerDiv: ElementRef;

  constructor(private authService: AuthService) { }

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
}
