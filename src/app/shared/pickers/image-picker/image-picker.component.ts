import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  CameraResultType,
  CameraSource,
  Capacitor,
  Plugins,
} from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  // With output I will be able to access the imagePick from outside this file in the html.
  // WIth @INPUT I can input from ann html /browser and assgn it to the property in this file

  @Output() imagePick = new EventEmitter<string  | File>();
  @Input() showPreview = false;
   // we can use the filePickerRef to access the element on the Dom
   @ViewChild('filePicker', {static: false}) filePickerRef: ElementRef<HTMLInputElement>;
  selectedImage: string;
  usePicker = false;
  constructor(private platform: Platform) {}

  ngOnInit() {
    console.log('Mobile:', this.platform.is('mobile'));
    console.log('Hybrid:', this.platform.is('hybrid'));
    console.log('Ios:', this.platform.is('ios'));
    console.log('Android:', this.platform.is('android'));
    console.log('Desktop:', this.platform.is('desktop'));
    if((this.platform.is('mobile') && !this.platform.is('hybrid') ) || this.platform.is('desktop')){
      this.usePicker = true;
    }
  }
  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera') ) {
    // if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.DataUrl, // Base64 means the image is translated into a string
    })
      .then((image) => {
        this.selectedImage = image.dataUrl;
        this.imagePick.emit(image.dataUrl); // emiting the image I have taken with camera to be available elsewhere
      })
      .catch((err) => {
        console.log(err);
        if(this.usePicker){
        this.filePickerRef.nativeElement.click();}
      });
  }

  onFileChosen(event: Event){
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if(!pickedFile){
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fileReader.readAsDataURL(pickedFile);
    console.log(event);

  }
}
