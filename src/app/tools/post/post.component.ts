import { Component, Input, OnInit } from '@angular/core'
import { PostData } from 'src/app/pages/post-feed/post-feed.component'
import { FirebaseTSFirestore, OrderBy } from 'firebasets/firebasetsFirestore/firebaseTSFirestore'
import { MatDialog } from '@angular/material/dialog'
import { ReplyComponent } from '../reply/reply.component'
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp'
import { AppComponent } from 'src/app/app.component'

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input()
  postData!: PostData

  creatorName!: string
  creatorDescription!: string
  firestore = new FirebaseTSFirestore()
  postLiked = false
  totalLikes = 0
  constructor (private readonly dialog: MatDialog) { }

  ngOnInit (): void {
    this.getCreatorInfo()
    this.getAllPostLikes()
  }

  onReplyClick () {
    this.dialog.open(ReplyComponent, { data: this.postData.postId })
  }

  onLikeClick () {
    // Like the Post
    this.firestore.create(
      {
        path: ['Posts', this.postData.postId, 'PostLikes', AppComponent.getUserDocument()?.userId!],
        data: {
          timestamp: FirebaseTSApp.getFirestoreTimestamp()
        },
        onComplete: () => {
          this.postLiked = true
          this.totalLikes++
        }
      }
    )
  }

  onUnlikeClick () {
    // Unlike the Post
    this.firestore.delete(
      {
        path: ['Posts', this.postData.postId, 'PostLikes', AppComponent.getUserDocument()?.userId!],
        onComplete: () => {
          this.postLiked = false
          this.totalLikes--
        }
      }
    )
  }

  getAllPostLikes () {
    this.firestore.getCollection(
      {
        path: ['Posts', this.postData.postId, 'PostLikes'],
        where: [new OrderBy('timestamp', 'desc')],
        onComplete: result => {
          // Set conditional variables/metrics
          this.totalLikes = result.size
          result.docs.forEach(
            doc => {
              // Has the logged in user liked this post?
              if (doc.id === AppComponent.getUserDocument()?.userId!) {
                this.postLiked = true
              }
            }
          )
        },
        onFail: err => {
          console.log('Error in getAllPostLikes: ', err)
        }
      }
    )
  }

  getCreatorInfo () {
    this.firestore.getDocument(
      {
        path: ['Users', this.postData.creatorId],
        onComplete: result => {
          const userDocument = result.data()
          this.creatorName = userDocument?.['publicName']
          this.creatorDescription = userDocument?.['description']
        }
      }
    )
  }
}
