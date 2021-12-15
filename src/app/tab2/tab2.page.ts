import { Component, OnInit } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { Router } from '@angular/router';

import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  name: string;
  uid: string;
  phone: string;
  email: string;
  clgPassing: string;
  clgCollege: string;

  clgPercentage: number;
  hscPassing: string;
  hscCollege: string;

  hscPercentage: number;

  sscPassing: string;
  sscCollege: string;

  sscPercentage: number;
  cloudFiles = [];
  constructor(
    private afStorage: AngularFireStorage,
    private router: Router,
    private storage: Storage
  ) {}

  async ngOnInit() {
    this.loadFiles();
    await this.storage.create();

    this.name = await this.storage.get('name');
    this.email = await this.storage.get('email');
    this.phone = await this.storage.get('phone');
    this.uid = await this.storage.get('ucid');

    this.clgPassing = await this.storage.get('clgPassing');
    this.clgCollege = await this.storage.get('clgCollege');
    this.clgPercentage = await this.storage.get('clgPercentage');

    this.hscPassing = await this.storage.get('hscPassing');
    this.hscCollege = await this.storage.get('hscCollege');
    this.hscPercentage = await this.storage.get('hscPercentage');

    this.sscPassing = await this.storage.get('sscPassing');
    this.sscCollege = await this.storage.get('sscCollege');
    this.sscPercentage = await this.storage.get('sscPercentage');
  }

  loadFiles() {
    this.cloudFiles = [];
    const StorageRef = this.afStorage.storage.ref('filesStorage');
    StorageRef.listAll().then((result) => {
      result.items.forEach(async (ref) => {
        this.cloudFiles.push({
          name: ref.name,
          full: ref.fullPath,
          ref,
          url: await ref.getDownloadURL(),
        });
      });
    });
  }
}
