import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Post } from './post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) { }

  // Return a copy of the posts array
  getPosts() {
    this.http.get<Post[]>('http://localhost:3000/api/posts', { observe: 'response' })
      .subscribe((response) => {
        this.posts = response.body;
        this.postsUpdated.next([...this.posts]);
      }, (error: HttpErrorResponse) => {
        console.log(error);
      });
  }

  getPost(id: string) {
    return this.http.get<Post>(`http://localhost:3000/api/posts/${id}`);
  }

  // Listen for post updates
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  // Add a post and emit an update event
  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<Post>('http://localhost:3000/api/posts', postData, { observe: 'response' }).subscribe((response) => {
      this.posts.push(response.body);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
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
      postData = { _id: id, title, content, imagePath: image };
    }

    this.http.put<Post>(`http://localhost:3000/api/posts/${id}`, postData, { observe: 'response' })
      .subscribe((response) => {
        const oldPostIndex = this.posts.findIndex((postEl) => {
          return postEl._id === response.body._id;
        });
        this.posts[oldPostIndex] = response.body;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string) {
    this.http.delete<Post>(`http://localhost:3000/api/posts/${id}`, { observe: 'response' }).subscribe((response) => {
      this.posts = this.posts.filter((el) => {
        return el._id !== response.body._id;
      });

      this.postsUpdated.next([...this.posts]);
    });
  }
}
