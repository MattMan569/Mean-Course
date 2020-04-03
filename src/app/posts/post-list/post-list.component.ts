import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit, OnDestroy {
  private postsSubscription: Subscription;
  private authListenerSubscription: Subscription;
  isAuthenticated = false;
  userId: string;
  isLoading = false;
  posts: Post[] = [];
  count: number;
  pageSize: number;
  page = 1;
  pageSizeOptions = [1, 2, 5, 10];

  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.pageSize = +localStorage.getItem('pageSize') || 2;
    this.postsService.getPosts(this.pageSize, this.page);
    this.userId = this.authService.getUserId();
    this.postsSubscription = this.postsService.getPostUpdateListener().subscribe((postData) => {
      this.posts = postData.posts;
      this.count = postData.count;
      this.isLoading = false;
    });

    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe((authStatus) => {
      this.isAuthenticated = authStatus;
      this.userId = this.authService.getUserId();
    });
  }

  // Update the pagination options
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.page = pageData.pageIndex + 1;
    this.pageSize = pageData.pageSize;
    localStorage.setItem('pageSize', this.pageSize.toString());
    this.postsService.getPosts(this.pageSize, this.page);
  }

  onDelete(id: string) {
    this.isLoading = true;

    // If there is only one page remaining on the last page,
    // and the user is currently viewing the last page,
    // then decrement the current page
    if ((this.count % this.pageSize === 1) && (this.page === Math.ceil(this.count / this.pageSize))) {
      this.page--;
    }

    this.postsService.deletePost(id).subscribe(() => {
      this.postsService.getPosts(this.pageSize, this.page);
    });
  }

  ngOnDestroy() {
    this.authListenerSubscription.unsubscribe();
    this.postsSubscription.unsubscribe();
  }
}
