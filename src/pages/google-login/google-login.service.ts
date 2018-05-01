import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { GooglePlus } from '@ionic-native/google-plus';
import { NativeStorage } from '@ionic-native/native-storage';
import { GoogleUserModel } from './google-user.model';

@Injectable()
export class GoogleLoginService {

  webClientId: string = "1001905109734-cnkoa7unjev55lii0rftbfm0kvb37gqr.apps.googleusercontent.com";

  constructor(
    public http: Http,
    public nativeStorage: NativeStorage,
    public googlePlus: GooglePlus
  ) {}

  trySilentLogin()
  {
    //checks if user is already signed in to the app and sign them in silently if they are.
    let env = this;
    return new Promise<GoogleUserModel>((resolve, reject) => {
      env.googlePlus.trySilentLogin({
        'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': this.webClientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true
      })
      .then(function (user) {
        env.setGoogleUser(user)
        .then(function(res){
          resolve(res);
        });
      }, function (error) {
        reject(error);
      });
    });
  }

  doGoogleLogin()
  {
    let env = this;

    return new Promise<GoogleUserModel>((resolve, reject) => {

      env.googlePlus.login({
        'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': this.webClientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true
      })
      .then(function (user) {
        env.setGoogleUser(user)
        .then(function(res){
          resolve(res);
        });
      }, function (error) {
        reject(error);
      });
    });
  }

  doGoogleLogout()
  {
    let env = this;
    return new Promise((resolve, reject) => {
      this.googlePlus.logout()
      .then(function(response) {
        //user logged out so we will remove him from the NativeStorage
        env.nativeStorage.remove('google_user');
        resolve();
      }, function(error){
        reject(error);
      });
    });
  }

  getGoogleUser()
  {
    return this.nativeStorage.getItem('google_user');
  }

  setGoogleUser(user: any)
  {
    let env = this;
    return new Promise<GoogleUserModel>((resolve, reject) => {
      this.getFriendsFakeData()
      .then(data => {
        resolve(env.nativeStorage.setItem('google_user',
          {
            userId: user.userId,
            name: user.displayName,
            email: user.email,
            image: user.imageUrl,
            friends: data.friends,
            photos: data.photos
          })
        );
      });
    });
  }

  getFriendsFakeData(): Promise<GoogleUserModel> {
    return this.http.get('./assets/example_data/social_integrations.json')
     .toPromise()
     .then(response => response.json() as GoogleUserModel)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }


}
