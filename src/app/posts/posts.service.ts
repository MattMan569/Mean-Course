import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Post } from './post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) { }

  // Return a copy of the posts array
  getPosts() {
    this.http.get<{ message: string, posts: Post[] }>('http://localhost:3000/api/posts').subscribe((postData) => {
      this.posts = postData.posts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  // Listen for post updates
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  // Add a post and emit an update event
  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.http.post<Post>('http://localhost:3000/api/posts', post).subscribe((postData) => {
      this.posts.push(postData);
      this.postsUpdated.next(this.posts);
    });
  }
}
