// import { Injectable } from "@nestjs/common";
// const { default: Bottleneck } = require('bottleneck');
// const { log } = require('console');
// const fs = require('fs')
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const { google } = require('googleapis');
// // var { photos, admin } = require('./server/model/model');

// const limiter = new Bottleneck({
//     minTime: 110,
// });

// interface admin  {
//     refreshToken: String,
//     createdAt: Date,
// }

// const scopes = [
//     'https://www.googleapis.com/auth/drive',
//     'https://www.googleapis.com/auth/drive.file',
// ];
// @Injectable()
// export class GoogleDriveService {
//     driveClient: any;
//     constructor( clientId, clientSecret, redirectUri, refreshToken) {
//         try {

//             this.driveClient = this.createDriveClient(clientId, clientSecret, redirectUri, refreshToken, scopes);
//         } catch (error) {
//             console.log(error + 'error22');
//         }
//     }

//     createDriveClient(clientId, clientSecret, redirectUri, refreshToken, scopes) {
//         var client = new google.auth.OAuth2(clientId, clientSecret, redirectUri, scopes);
//         client.on('tokens', (tokens) => {
//             // update the database with the new access token and its new expiry date
//             if (tokens.refresh_token) {
//                 // store the refresh_token in my database!
//                 console.log(`REFRESH TOKEN: ${tokens.refresh_token}`);
//                 // const rfTokenDetails = new admin({
//                 //     refreshToken: tokens.refresh_token,
//                 //     createdAt: new Date()
//                 // }).save().catch(err => { console.log(err.message); });
//             }
//             // const Post = mongoose.model("admin", {
//             //     refreshToken: String,
//             //     createdAt: Date,
//             //   });
//             // const posts = admin.find();
//             // console.log(posts);

//             // // Use the `sort()` method to sort the results by the time field.
//             // const sortedPosts = posts.sort({ createdAt: -1 });
//             // // console.log(sortedPosts);

//             // // Print the results to the console.
//             // sortedPosts.forEach(post => {
//             //     console.log(post);
//             // });

//             console.log(`ACCESS TOKEN: ${tokens.access_token}`);
//         });

//         client.setCredentials({ refresh_token: refreshToken });
//         return google.drive({
//             version: 'v3',
//             auth: client,
//         });
//     }
//      createFolder(folderName, folderId) {
//         console.log({ id: folderId });
//         return limiter.schedule(() => this.driveClient.files.create({
//             resource: {
//                 name: folderName,
//                 mimeType: 'application/vnd.google-apps.folder',
//                 parents: [folderId]
//             },
//             fields: 'id, name',
//         }));
//     }

//     searchFolder(folderName, folderId) {
//         var _this = this;
//         console.log("mimeType='application/vnd.google-apps.folder' and name='".concat(folderName, "' and ", "parents='", `${[folderId]}`, "' and ", "trashed=false"));
//         return limiter.schedule(() => new Promise(function (resolve, reject) {
//             _this.driveClient.files.list({
//                 q: "mimeType='application/vnd.google-apps.folder' and name='".concat(folderName, "' and ", "parents='", `${[folderId]}`, "' and ", "trashed=false"),
//                 fields: 'files(id, name)',
//             }, function (err, res) {
//                 if (err) {
//                     return reject(err);
//                 }
//                 return resolve(res.data.files ? res.data.files[0] : null);
//             });
//         }));
//     }
//     saveFile(fileName, filePath, fileMimeType, folderId) {
//         var res = limiter.schedule(() => this.driveClient.files.create({
//             requestBody: {
//                 name: fileName,
//                 mimeType: fileMimeType,
//                 parents: folderId ? [folderId] : [],
//             },
//             media: {
//                 mimeType: fileMimeType,
//                 body: fs.createReadStream(filePath),
//             },
//             function(err, response, body) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log(response);
//                     // clearInterval(q);
//                 }
//             }
//         }));
//         // var q = setInterval(function () {
//         //     console.log(res);
//         //     // console.log("Uploaded: " + res.req.connection.bytesWritten);
//         // }, 250);
//         return res
//     }
//     getDetails(fileId) {
//         var request = limiter.schedule(() => this.driveClient.files.get({
//             fileId: fileId,
//             // fields: 'webContentLink'
//         }).then(function (success) {
//             console.log(success);
//             var webContentLink = success.result.webContentLink; //the link is in the success.result object

//             //success.result    
//         }, function (fail) {
//             console.log(fail);
//             console.log('Error ' + fail.result.error.message);
//         }));
//         // var request = this.driveClient.files.get({
//         //   'fileId': fileId
//         // });
//         // console.log(request.data);
//         // return request.execute(function(resp) {
//         //   console.log('Title: ' + resp.title);
//         //   console.log('Description: ' + resp.description);
//         //   console.log('MIME type: ' + resp.mimeType);
//         // });
//     }
// }
