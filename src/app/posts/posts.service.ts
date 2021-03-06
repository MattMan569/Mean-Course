import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from './../../environments/environment';
import { Post } from './post.model';

const SERVER_URL = `${environment.apiUrl}/posts`;

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private count: number;
  private postsUpdated = new Subject<{ posts: Post[], count: number }>();
  private requestError = new Subject<null>();

  constructor(private http: HttpClient, private router: Router) { }

  private emitPosts = () => {
    this.postsUpdated.next({
      posts: [...this.posts],
      count: this.count,
    });
  }

  // Return a copy of the posts array
  getPosts(postsPerPage: number, currentPage: number) {
    // Set the pagination query parameters
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;

    this.http.get<{ posts: Post[], count: number }>(`${SERVER_URL}${queryParams}`, { observe: 'response' })
      .subscribe((response) => {
        this.posts = response.body.posts;
        this.count = response.body.count;
        this.emitPosts();
      }, (error: HttpErrorResponse) => {
        console.log(error);
      });
  }

  getPost(id: string) {
    return this.http.get<Post>(`${SERVER_URL}/${id}`);
  }

  // Listen for post updates
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  // Listen for request errors
  getRequestErrorListener() {
    return this.requestError.asObservable();
  }

  // Add a post and emit an update event
  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<Post>(`${SERVER_URL}`, postData, { observe: 'response' })
      .subscribe((response) => {
        this.router.navigate(['/']);
      }, () => {
        this.requestError.next();
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;

    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        _id: id,
        creator: null,
        title,
        content,
        imagePath: image,
      };
    }

    this.http.put<Post>(`${SERVER_URL}/${id}`, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      }, () => {
        this.requestError.next();
      });
  }

  deletePost(id: string) {
    return this.http.delete<Post>(`${SERVER_URL}/${id}`);
  }
}
