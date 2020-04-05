import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './../../validators/mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  private requestErrorSubscription: Subscription;
  private mode: 'create' | 'edit';
  private id: string;
  isLoading = false;
  post: Post;
  form: FormGroup;
  imagePreview: string;

  constructor(private postsService: PostsService, private route: ActivatedRoute) { }

  ngOnInit() {
    // Create a reactive form
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
    });

    this.requestErrorSubscription = this.postsService.getRequestErrorListener()
      .subscribe(() => {
        this.isLoading = false;
      });

    // If the id param is present then the form is in edit mode
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.id = paramMap.get('id');
        this.isLoading = true;

        // Get the post specified by the id param
        this.postsService.getPost(this.id).subscribe((post) => {
          this.isLoading = false;
          this.post = post;

          // Populate the form with the retrieved values
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.id = null;
        this.post = null;
      }
    });
  }

  // Form has been submitted
  onSavePost() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postsService.updatePost(this.id, this.form.value.title, this.form.value.content, this.form.value.image);
    }
  }

  // User has selected an image
  onImagePicked(event: Event) {
    // Get the selected image and update the form control with it
    const file = (event.target as HTMLInputElement).files[0];

    this.form.patchValue({ image: file });

    if (!file) {
      return;
    }

    // Alert Angular to the control change
    this.form.get('image').updateValueAndValidity();

    // Convert the image to a data URL string for use in the preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy() {
    this.requestErrorSubscription.unsubscribe();
  }
}
