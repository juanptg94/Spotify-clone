const express = require('express');
const querystring = require('querystring');
const SpotifyWebApi = require('spotify-web-api-node');
var client_id = 'c4f9810f2930422e9ed004f94107bf0a';
var client_secret = '586dea12b3df4d399d3ab6db727ddb07';
var redirect_uri = 'http://localhost:3000/dashboard/inicio';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
var musicbrainz_apikey = '1fdddb0af82b4b39dc4e3f05423501b8';
var musicbrainzmapiUrl = 'https://musicbrainz.org/ws/2';
const spotifyWebApi = require('spotify-web-api-node');
const bodyParser = require('body-parser');
const axios = require('axios');
const AxiosRequest = require('./utils/axiosRequests');
const cors = require('cors');
var app = express();
const jose = require('node-jose');
const CryptoJS = require('crypto-js');
const criptojsKey = 'Paporu';
const jwt = require('jsonwebtoken');
const { verify } = require('crypto');

const jwtSecret = 'Paporu';
const privateKey = 'MIICXAIBAAKBgHle40wABzHzDRAsnQbwsQHBnU23L8XQkHS5OP4GDNkhbehro3A5' +
  'HcYT11F/dZLXv6GfeTLmZWTfQNmS0zN6ov+lz/Fpqiz9NgcQJfDgpVNtwgdDBQgp' +
  'oddE7+OrQdDoGhVxGX52Mex7eCBP1VLPfbPHn0ZlOpWF6ZqjHUX8Fmt1AgMBAAEC' +
  'gYAePJR1z5/7QqjjeanZG8eNP3X38YY2SuJiIe7f4hP7WAewmnhKMgCH41OGGzHo' +
  'VlWIZ1ljY+Cow7G9QoXZUlke6Y9Acty/x3HW/wBnetgnSjpHeuaZLPexu+d6+wed' +
  'ZagXw1N2glmZePig/8jI8e60BH+vAX3uZJFPirb522pb9QJBAO5N0HW+LbQyg5jf' +
  'BGUc1PkKerC8EBY5beEcQEeKYm2Mb+8WRi8GHGhUcVK+xhWAk5k4cdFQLtQvgCQl' +
  'jL/Te98CQQCCYihyI55B0qIrQZ3UfS/ZLr/nSFs5cs/YrtsXSPpmFXTI8X0lQSvO' +
  'jjH4FvYtCP70AAL8i9bvsntFDhLagwMrAkEAioyVUY+DlQv1dPDc5kiwDicolA6T' +
  'L8it+L5rJOzxMw3+mjwSDA76fzHxPRGLqz65EdE+Y1rCDz2au+lU/sZfcwJASpCo' +
  'YN5N24cCh4p3INaXTrWVukd/JFOs2lblpWNvEIKkz2aME4o5618W5LL9BrRmWlTH' +
  'YHb47Qw9wzhRP/Y9EQJBAOGO2f2U4kTiYqJFsebF/K8tAFjDQwkW9E/9mSND9q08' +
  'ffCEbFNJJayxyHEL8rXXZjVkxczUYBtW1yOPTdoJIrg=';
const publicKey = `MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHle40wABzHzDRAsnQbwsQHBnU23
  L8XQkHS5OP4GDNkhbehro3A5HcYT11F/dZLXv6GfeTLmZWTfQNmS0zN6ov+lz/Fp
  qiz9NgcQJfDgpVNtwgdDBQgpoddE7+OrQdDoGhVxGX52Mex7eCBP1VLPfbPHn0Zl
  OpWF6ZqjHUX8Fmt1AgMBAAE=`;
//app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect('mongodb://clone:spotify@mongo:27017/TokenDB', {family:4, useNewUrlParser: true, useUnifiedTopology: true }).then(() => { ('Connected to Mongoose database') });
const db = mongoose.connection;
const accessTokenSchema = new mongoose.Schema({
  userId: String,
  access_token: String,
  expires_in: Number,
  refresh_token: String,
  token_issued_at: Number,
});
const AccessToken = mongoose.model('AccessToken', accessTokenSchema);

const encryptPayload = (userId) => {

  const encryptedPayload = CryptoJS.AES.encrypt(userId, jwtSecret);
  return encryptedPayload.toString()
};
const decryptPayload = (encryptedPayload) => {

  var decryptedUserId = CryptoJS.AES.decrypt(encryptedPayload, jwtSecret);
  decryptedUserId = decryptedUserId.toString(CryptoJS.enc.Utf8)
  return decryptedUserId.toString()
};
const createJwtToken = (encryptedUserId) => {
  const payload = {
    encryptedUserId: encryptedUserId
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
  return token;


}

const verifyToken = (jwtToken) => {



  jwtToken = jwtToken.split(' ')[1];

  const payload = jwt.verify(jwtToken, jwtSecret);

  return payload;

}
app.post('/refreshjwtToken', function (req, res) {

  const jwtOldToken = req.body.jwtToken;

  const decodedJwtToken= jwt.decode(jwtOldToken);
  const encodedUserId=decodedJwtToken.encryptedUserId;
  const userId=decryptPayload(encodedUserId);

  const encryptedAccessToken = encryptPayload(userId);


  const jwtToken = createJwtToken(encryptedAccessToken);
  res.json({ token: jwtToken });
});
async function verifyEncriptedJwtToken(req, res, next) {

  const encryptedJwtToken = req.headers.authorization;



  let Encryptedpayload;
 
  try {
    Encryptedpayload = verifyToken(encryptedJwtToken);
    
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = decryptPayload(Encryptedpayload.encryptedUserId);
  


  const currentTime = Math.floor(Date.now() / 1000); 

  
  const token = await AccessToken.findOne({ userId: userId });
  let refresh = token.refresh_token
  let expires_in = token.expires_in
  let token_issued_at = token.token_issued_at

  var expires_time = token_issued_at + expires_in;



  if (expires_time > currentTime) {

    req.user = token.access_token;
    next();
  } else {
    var newToken = await this.getRefreshToken(refresh)
    let { access_token, refresh_token, expires_in } = newToken
    const token_issued = Math.floor(Date.now() / 1000);
    const token = new AccessToken({ userId, access_token, refresh_token, expires_in, token_issued_at: token_issued });
    token.save().then(() => {
    })


    req.user = token.access_token
    next();

  }


}
app.get('/login', function (req, res) {


  var scope = 'streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state user-top-read user-follow-read user-read-recently-played playlist-modify-private playlist-modify-public user-follow-modify';




  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri

    }));




});

app.post('/auth', async function (req, res) {
  var code = req.body.code;
  let response = await authSpotify(code)

  let { access_token, refresh_token, expires_in } = response
  const token_issued_at = Math.floor(Date.now() / 1000);
  const userId = uuidv4();
  const token = new AccessToken({ userId, access_token, refresh_token, expires_in, token_issued_at })
  token.save();
  const encryptedPayload = encryptPayload(userId);

  const jwtUserIdToken = createJwtToken(encryptedPayload);

 
  res.status(200).json({ OK: true, data: { jwtToken: jwtUserIdToken } })


});


authSpotify = async (code) => {
  return new Promise(async (resolve, reject) => {
    let data = {
      code: code,
      'redirect_uri': 'http://localhost:3000/dashboard/inicio',
      'grant_type': 'authorization_code'
    }

    let authparams = `${client_id}:${client_secret}`;
    let b64string = Buffer.from(authparams).toString('base64');
    let authorization = `Basic ${b64string}`;

    let headers = {
      'Authorization': authorization,
      'Content-Type': 'application/x-www-form-urlencoded',


    }

    let url = 'https://accounts.spotify.com/api/token'

    const response = await AxiosRequest.execRequest(url, data, headers, 'post')

    resolve(response)
  })
}
app.post('/several-tracks', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;


  let response = await severalTracks(access_token)
  res.status(200).json({ OK: true, data: response })
});
severalTracks = async (access_token) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = 'https://api.spotify.com/v1/browse/new-releases'

    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-artist', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user
  var id = req.body.id;

  let response = await getArtist(access_token, id)
  res.status(200).json({ OK: true, data: response })
});
getArtist = async (access_token, id) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/artists/${id}`

    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-followedartist', verifyEncriptedJwtToken, async function (req, res) {

  var access_token = req.user;



  let response = await getFollowedArtist(access_token);
  res.status(200).json({ OK: true, data: response })
});
getFollowedArtist = async (access_token) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/me/following?type=artist`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-toptracks', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user
  var id = req.body.id;

  let response = await topTracks(access_token, id)
  res.status(200).json({ OK: true, data: response })
});
topTracks = async (access_token, id) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=ES`;

    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-tracks', async function (req, res) {
  var access_token = req.body.access_token;
  var id = req.body.id;
  var market = req.body.market;

  let response = await getTracks(access_token, id)
  res.status(200).json({ OK: true, data: response })
});
getTracks = async (access_token, id) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/tracks?ids=${id}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-album', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var id = req.body.id;

  let response = await getAlbum(access_token, id)
  res.status(200).json({ OK: true, data: response })
});
getAlbum = async (access_token, id) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/artists/${id}/albums`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-usertoptracks', async function (req, res) {
  var access_token = req.body.access_token;
  var type = req.body.type;

  let response = await getUserTopTracks(access_token, type)
  res.status(200).json({ OK: true, data: response })
});
getUserTopTracks = async (access_token, type) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/me/top/${type}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-usertopartists', async function (req, res) {
  var access_token = req.body.access_token;
  var type = req.body.type;

  let response = await getUserTopArtists(access_token, type)
  res.status(200).json({ OK: true, data: response })
});
getUserTopArtists = async (access_token, type) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/me/top/${type}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-recentlyplayed', async function (req, res) {
  var access_token = req.body.access_token;


  let response = await getRecentlyPlayed(access_token)
  res.status(200).json({ OK: true, data: response })
});
getRecentlyPlayed = async (access_token) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/me/player/recently-played`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-album', async function (req, res) {
  var access_token = req.body.access_token;

  var id = req.body.id;

  let response = await getAlbum(access_token, id);
  res.status(200).json({ OK: true, data: response })
});
getAlbum = async (access_token, id) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/albums/${id}`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/search-tracks', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;

  var queryString = req.body.queryString;

  let response = await searchTracks(access_token, queryString);
  res.status(200).json({ OK: true, data: response })
});
searchTracks = async (access_token, queryString) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/search?q=${queryString}&type=track`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/search-artists', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;

  var queryString = req.body.queryString;
  
  let response = await searchArtists(access_token, queryString);
  res.status(200).json({ OK: true, data: response })
});
searchArtists = async (access_token, queryString) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/search?q=${queryString}&type=artist`;

    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/search-album', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user

  var queryString = req.body.queryString;
 
  let response = await searchAlbum(access_token, queryString);
  res.status(200).json({ OK: true, data: response })
});
searchAlbum = async (access_token, queryString) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/search?q=${queryString}&type=album`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/search-playlist', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user

  var queryString = req.body.queryString;

  let response = await searchPlaylist(access_token, queryString);
  res.status(200).json({ OK: true, data: response })
});
searchPlaylist = async (access_token, queryString) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/search?q=${queryString}&type=playlist`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}

app.post('/get-userplaylists', verifyEncriptedJwtToken, async function (req, res) {

  var access_token = req.user;

  var user_id = req.body.user_id;

  let response = await getUserPlaylists(access_token, user_id);
  res.status(200).json({ OK: true, data: response })
});
getUserPlaylists = async (access_token, user_id) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/users/${user_id}/playlists`;




    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-usersavedtracks', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;


  let response = await getUserSavedTracks(access_token);
  res.status(200).json({ OK: true, data: response })
});
getUserSavedTracks = async (access_token) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/me/tracks`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-currentuserprofile', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;


  let response = await getCurrentUserProfile(access_token);
  res.status(200).json({ OK: true, data: response })
});
getCurrentUserProfile = async (access_token) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/me`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}

app.post('/get-playlistbyid', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var playlist_id = req.body.playlist_id;


  let response = await getPlaylistbyid(access_token, playlist_id);
  res.status(200).json({ OK: true, data: response })
});
getPlaylistbyid = async (access_token, playlist_id) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/playlists/${playlist_id}`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/saveTrack', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var trackid = req.body.trackid;
 
  let response = await saveTrack(access_token, trackid);

  res.status(200).json({ OK: true, data: response })

});
saveTrack = async (access_token, trackid) => {
  return new Promise(async (resolve, reject) => {

    let data = {
      ids: trackid
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'


    }

    let url = `https://api.spotify.com/v1/me/tracks?ids=${trackid}`;

    const response = await AxiosRequest.execRequest(url, data, headers, 'put')

    resolve(response)
  })
}
app.post('/checkSavedTrack', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var trackid = req.body.trackid;

  let response = await checkSavedTrack(access_token, trackid);

  res.status(200).json({ OK: true, data: response })
});
checkSavedTrack = async (access_token, trackid) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token



    }


    let url = `https://api.spotify.com/v1/me/tracks/contains?ids=${trackid}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/addTrackToPlaylist', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var playlistid = req.body.playlistid;
  var trackid = req.body.trackid;


  let response = await addTrackToPlaylist(access_token, playlistid, trackid);

  res.status(200).json({ OK: true, data: response })
});
addTrackToPlaylist = async (access_token, playlistid, trackid) => {
  return new Promise(async (resolve, reject) => {
    let trackuri = `spotify:track:${trackid}`
    let data = {
      uris: [trackuri]
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token




    }

    let url = `https://api.spotify.com/v1/playlists/${playlistid}/tracks`;

    const response = await AxiosRequest.execRequestJSON(url, data, headers, 'post')

    resolve(response)
  })
}


app.post('/removeTrackToPlaylist', async function (req, res) {
  var access_token = req.body.access_token;
  var playlistid = req.body.playlistid;

  var trackid = req.body.trackid;
  var snapshotid = req.body.snapshotID;
  
  let response = await removeTrackToPlaylist(access_token, playlistid, trackid, snapshotid);

  res.status(200).json({ OK: true, data: response })
});
removeTrackToPlaylist = async (access_token, playlistid, trackid, snapshotID) => {
  return new Promise(async (resolve, reject) => {
    let trackuri = `spotify:track:${trackid}`
    let data = {
      tracks: [{ uri: trackuri, }

      ],
      snapshot_id: snapshotID
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json',
      'Accept': 'application/json',

    }
 

    let url = `https://api.spotify.com/v1/playlists/${playlistid}/tracks`;
   

    const response = await AxiosRequest.execRequestJSON(url, data, headers, 'DELETE')

    resolve(response)
  })
}

app.post('/createPlaylist', async function (req, res) {
  var access_token = req.body.access_token;
  var user_id = req.body.user_id;
  var name = req.body.name;
  var description = req.body.description;
  var public = req.body.publicbool;


  let response = await createPlaylist(access_token, user_id, name, description, public);

  res.status(200).json({ OK: true, data: response })
});
createPlaylist = async (access_token, user_id, name, description, public) => {
  return new Promise(async (resolve, reject) => {

    let data = {
      name: name,
      description: description,
      public: public
    };


  
    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'



    }
   

    let url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
   

    const response = await AxiosRequest.execRequestJSON(url, data, headers, 'post')

    resolve(response)
  })
}

app.post('/removeTrack', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var trackid = req.body.trackid;

  let response = await removeTrack(access_token, trackid);

  res.status(200).json({ OK: true, data: response })
});
removeTrack = async (access_token, trackid) => {
  return new Promise(async (resolve, reject) => {

    let data = {
      ids: trackid
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'


    }


    let url = `https://api.spotify.com/v1/me/tracks?ids=${trackid}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'DELETE')

    resolve(response)
  })
}
app.post('/refreshToken', verifyEncriptedJwtToken, async function (req, res) {
  var refreshToken = req.body.refreshToken;

  let response = await getRefreshToken(refreshToken)
  res.status(200).json({ OK: true, data: response })
});


getRefreshToken = async (refreshToken) => {
  return new Promise(async (resolve, reject) => {
    let data = {

      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }

    let authparams = `${client_id}:${client_secret}`;
    let b64string = Buffer.from(authparams).toString('base64');
    let authorization = `Basic ${b64string}`;

    let headers = {
      'Authorization': authorization,
      'Content-Type': 'application/x-www-form-urlencoded',


    }

    let url = 'https://accounts.spotify.com/api/token'

    const response = await AxiosRequest.execRequest(url, data, headers, 'post')

    resolve(response)
  })
}
app.post('/followartist', verifyEncriptedJwtToken, async function (req, res) {

  var access_token = req.user;
  var artistid = req.body.artistid;

  let response = await followArtist(access_token, artistid);
  res.status(200).json({ OK: true, data: response })
});
followArtist = async (access_token, artistid) => {
  return new Promise(async (resolve, reject) => {

    let data = {
      ids: [artistid]
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'



    }

    let url = `https://api.spotify.com/v1/me/following?type=artist&ids=${artistid}`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'put')

    resolve(response)
  })
}
app.post('/checkFollowedArtist', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var artistid = req.body.artistid;

 
  let response = await checkFollowedArtist(access_token, artistid);

  res.status(200).json({ OK: true, data: response })
});
checkFollowedArtist = async (access_token, artistid) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token



    }


    let url = `https://api.spotify.com/v1/me/following/contains?type=artist&ids=${artistid}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/unfollowartist', verifyEncriptedJwtToken, async function (req, res) {

  var access_token = req.user;
  var artistid = req.body.artistid;
  

  let response = await unfollowArtist(access_token, artistid);
  res.status(200).json({ OK: true, data: response })
});
unfollowArtist = async (access_token, artistid) => {
  return new Promise(async (resolve, reject) => {

    let data = {
      ids: [artistid]
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'



    }

    let url = `https://api.spotify.com/v1/me/following?type=artist&ids=${artistid}`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'delete')

    resolve(response)
  })
}

app.post('/get-usersavedalbums', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;


  let response = await getUserSavedAlbums(access_token);
  res.status(200).json({ OK: true, data: response })
});
getUserSavedAlbums = async (access_token) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,



    }

    let url = `https://api.spotify.com/v1/me/albums`;



    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/saveAlbum', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var albumid = req.body.albumid;
  
  let response = await saveAlbum(access_token, albumid);

  res.status(200).json({ OK: true, data: response })

});
saveAlbum = async (access_token, albumid) => {
  return new Promise(async (resolve, reject) => {

    let data = {
      ids: albumid
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'


    }

    let url = `https://api.spotify.com/v1/me/albums?ids=${albumid}`;
   
    const response = await AxiosRequest.execRequest(url, data, headers, 'put')

    resolve(response)
  })
}

app.post('/removeAlbum', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var albumid = req.body.albumid;

  let response = await removeAlbum(access_token, albumid);

  res.status(200).json({ OK: true, data: response })
});
removeAlbum = async (access_token, albumid) => {
  return new Promise(async (resolve, reject) => {

    let data = {
      ids: albumid
    }


    let headers = {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'


    }


    let url = `https://api.spotify.com/v1/me/albums?ids=${albumid}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'DELETE')

    resolve(response)
  })
}

app.post('/checkSavedAlbum', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var albumid = req.body.albumid;

  let response = await checkSavedAlbum(access_token, albumid);

  res.status(200).json({ OK: true, data: response })
});
checkSavedAlbum = async (access_token, albumid) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token



    }
 

    let url = `https://api.spotify.com/v1/me/albums/contains?ids=${albumid}`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}

app.post('/get-FeaturedPlaylists', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;


  let response = await getFeaturedPlaylists(access_token);

  res.status(200).json({ OK: true, data: response })
});
getFeaturedPlaylists = async (access_token) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token



    }


    let url = `https://api.spotify.com/v1/browse/featured-playlists`;


    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}

app.post('/get-SongRecommendations', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var trackid = req.body.trackid;



  let response = await getSongsRecommendations(access_token, trackid);

  res.status(200).json({ OK: true, data: response })
});
getSongsRecommendations = async (access_token, trackid) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token



    }
  

    let url = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackid}`;
    

    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}
app.post('/get-ArtistRecommendations', verifyEncriptedJwtToken, async function (req, res) {
  var access_token = req.user;
  var artistid = req.body.artistid;



  let response = await getArtistsRecommendations(access_token, artistid);

  res.status(200).json({ OK: true, data: response })
});
getArtistsRecommendations = async (access_token, artistid) => {
  return new Promise(async (resolve, reject) => {

    let data = {

    }


    let headers = {
      'Authorization': 'Bearer ' + access_token



    }
    

    let url = `https://api.spotify.com/v1/recommendations?seed_artists=${artistid}`;
   

    const response = await AxiosRequest.execRequest(url, data, headers, 'get')

    resolve(response)
  })
}

app.listen(3001, () => { ("Spotify server listening at port 3001"); });

