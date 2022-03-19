import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { CreatePostComponent } from 'src/app/tools/create-post/create-post.component'
import { FirebaseTSFirestore, Limit, OrderBy, Where } from 'firebasets/firebasetsFirestore/firebaseTSFirestore'

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements OnInit {
  firestore = new FirebaseTSFirestore()
  posts: PostData [] = []
  constructor (private readonly dialog: MatDialog) { }

  ngOnInit (): void {
    this.getPosts()
  }

  onCreatePostClick () {
    this.dialog.open(CreatePostComponent)
  }

  getPosts () {
    this.firestore.getCollection(
      {
        path: ['Posts'],
        where: [
          new OrderBy('timestamp', 'desc'),
          new Limit(10)
        ],
        onComplete: (result) => {
          result.docs.forEach(
            doc => {
              const post = <PostData>doc.data()
              post.postId = doc.id
              this.posts.push(post)
            }
          )
        },
        onFail: err => {
          console.log('Error in getPosts: ', err)
        }
      }
    )
  }
}

export interface PostData {
  comment: string
  creatorId: string
  imageUrl?: string
  postId: string
}
