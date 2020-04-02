import { Component, OnInit } from '@angular/core';

import { Post } from './posts/post.model';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Automatically authenticate the user, if possible
    this.authService.autoAuthUser();
  }
}
