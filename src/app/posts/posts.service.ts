import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Post } from './post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor() { }

  // Return a copy of the posts array
  getPosts() {
    return [...this.posts];
  }

  // Listen for post updates
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  // Add a post and emit an update event
  addPost(title: string, content: string) {
    const post: Post = { title, content };
    this.posts.push(post);
    this.postsUpdated.next(this.posts);
  }
}
