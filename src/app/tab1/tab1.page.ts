import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

export interface imgFile {
  name: string;
  filepath: string;
  size: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  fileUploadTask: AngularFireUploadTask;

  // Upload progress
  percentageVal: Observable<number>;

  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  // Uploaded File URL
  UploadedImageURL: Observable<string>;

  // Uploaded image collection
  files: Observable<imgFile[]>;

  // Image specifications
  imgName: string;
  imgSize: number;

  // File uploading status
  isFileUploading: boolean;
  isFileUploaded: boolean;
  downloadURL: Observable<string>;
  private filesCollection: AngularFirestoreCollection<imgFile>;

  //resume info
  name: string;
  uid: string;
  phone: string;
  email: string;

  clgPassing: string;
  clgCollege: string;
  clgMarks: number;
  clgTotal: number;
  clgPercentage: number;

  hscPassing: string;
  hscCollege: string;
  hscMarks: number;
  hscTotal: number;
  hscPercentage: number;

  sscPassing: string;
  sscCollege: string;
  sscMarks: number;
  sscTotal: number;
  sscPercentage: number;

  constructor(
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private storage: Storage,
    private router: Router,
    private fileChooser: FileChooser
  ) {
    this.isFileUploading = false;
    this.isFileUploaded = false;

    // Define uploaded files collection
    this.filesCollection = afs.collection<imgFile>('imagesCollection');
    this.files = this.filesCollection.valueChanges();
  }

  uploadImage(event: FileList) {
    const file = event.item(0);
    this.isFileUploading = true;
    this.isFileUploaded = false;

    this.imgName = file.name;

    // Storage path
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;

    // Image reference
    const imageRef = this.afStorage.ref(fileStoragePath);

    // File upload task
    this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);

    this.percentageVal = this.fileUploadTask.percentageChanges();
    this.trackSnapshot = this.fileUploadTask.snapshotChanges().pipe(
      finalize(async () => {
        this.UploadedImageURL = imageRef.getDownloadURL();
        console.log('download url' + this.UploadedImageURL);
        this.downloadURL = imageRef.getDownloadURL();
        this.downloadURL = await imageRef.getDownloadURL();
        this.UploadedImageURL.subscribe(
          async (resp) => {
            this.storeFilesFirebase({
              name: file.name,
              filepath: resp,
              size: this.imgSize,
            });
            this.isFileUploading = false;
            this.isFileUploaded = true;
          },
          (error) => {
            console.log(error);
          }
        );
      }),
      tap((snap) => {
        this.imgSize = snap.totalBytes;
      })
    );
  }

  storeFilesFirebase(image: imgFile) {
    const fileId = this.afs.createId();

    this.filesCollection
      .doc(fileId)
      .set(image)
      .then((res) => {
        console.log('result' + res);
        console.log('downloadUrl' + this.downloadURL);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  profile: '';
  async ngOnInit() {
    await this.storage.create();
    const name = await this.storage.get('uname');
    console.log('uname is' + name);
  }

  async submitForm() {
    await this.storage.set('name', this.name);
    await this.storage.set('email', this.email);
    await this.storage.set('phone', this.phone);
    await this.storage.set('ucid', this.uid);

    await this.storage.set('clgPassing', this.clgPassing);
    await this.storage.set('clgCollege', this.clgCollege);
    this.clgPercentage = (this.clgMarks / this.clgTotal) * 100;
    await this.storage.set('clgPercentage', this.clgPercentage);

    await this.storage.set('hscPassing', this.hscPassing);
    await this.storage.set('hscCollege', this.hscCollege);
    this.hscPercentage = (this.hscMarks / this.hscTotal) * 100;
    await this.storage.set('hscPercentage', this.hscPercentage);

    await this.storage.set('sscPassing', this.sscPassing);
    await this.storage.set('sscCollege', this.sscCollege);
    this.sscPercentage = (this.sscMarks / this.sscTotal) * 100;
    await this.storage.set('sscPercentage', this.sscPercentage);

    this.router.navigate(['tabs/tab2']);
  }

  open_chooser() {
    this.fileChooser
      .open()
      .then((uri) => console.log(uri))
      .catch((e) => console.log(e));
  }
}
