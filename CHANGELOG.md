## Update to 3.1.1 (v1.4)
- With this release comes a major update to Angular (Angular 4.0!), the latest version of TypeScript, and some optional structural changes to your application. Ionic 3.0.0 removed the deprecated (old) grid. See the blog post for more information including steps to migrate: http://blog.ionic.io/build-awesome-desktop-apps-with-ionics-new-responsive-grid/
- We updated all angular libs to v4.0.2
- Please check all steps to upgrade here: https://github.com/driftyco/ionic/blob/master/CHANGELOG.md#300-2017-04-05
- We also upgrade to Ionic Native 3.x which will result in a smaller bundle size. With Ionic Native 3, native functionality was moved from static methods to using Angular injectables.
Read more here: http://blog.ionic.io/ionic-native-3-x/.
Example Upgrade Commit: https://github.com/driftyco/ionic-conference-app/commit/62088
- We now use EmailComposer plugin in order to send emails in the Contact Card Page.


## Update to 2.2.0 (v1.3)
- Ionic 2.1.0 improved the grid system. These caused several changes in their internal css (scss), so we have to adapt some .rows to be 100% width (they removed that property from <ion-row> element in their sass files). (for more details see the ionic [CHANGELOG](https://github.com/driftyco/ionic/blob/master/CHANGELOG.md#features-1))

## Update to 2.0.0 (v1.2)
- There's a breaking change in ionic 2.0.0 with the Ionicons.
	- We had to change the import for ionicons in theme/variables.scss file from `@import "ionicons";` to `@import "ionic.ionicons";`


- Some users where experiencing an issue with Google Maps typings getting the following error: `Cannot find namespace 'google'`. We solved this by adding `"typings/**/*.ts"` in tsconfig.json include array.



## Update to RC-5 (v1.1)
- There's a breaking change in ionic rc-5 with the `<ion-slides>` (for more details see the ionic [CHANGELOG](https://github.com/driftyco/ionic/blob/master/CHANGELOG.md#slides))

	- We had to remove the `[options]` attribute and change the `(ionDidChange)` event with `ionSlideDidChange` in the walkthrough.html file

- Ionic introduced [CSS content property](https://developer.mozilla.org/en-US/docs/Web/CSS/contain) to improve performance. This caused some weird behavior

	- Added `contain: style layout;` to `.horizontal-categories .scroll-content` in the `listing.scss` file

	- Added `contain: style layout;` to `.post-example-view .upload-image-button` in the `form-layout.scss` file

- Add css styles for tab button icon in `tabs-navigation.scss` file

- Ionic (rc-4) changed the way the toolbar border works (for more details see the ionic [CHANGELOG](https://github.com/driftyco/ionic/blob/master/CHANGELOG.md#toolbar))

	- We had to add an `!important` value to force no border on the `.toolbar-background` element in header.scss file

- Ionic added fixed height to some components (including list items avatars). This caused some weird behavior with our custom components `preload-image`

	- We added `height: inherit !important;` to our `preload-image img` elements in preload-image.scss file
