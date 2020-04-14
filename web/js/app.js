/* global $ OT SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var archiveID;

var apiKey = "46668762";
var sessionId = "1_MX40NjY2ODc2Mn5-MTU4Njc2NzU1ODQ4N35XRmwvdnNRUlpQdERjMzR3b1RVRGdwL2F-fg"; //2_MX40NjY2ODc2Mn5-MTU4NjY4MDkyNzE0NH5obklnTlRhemVGMGxUZjN4Uzc0bmJDTlB-fg";
var token = "T1==cGFydG5lcl9pZD00NjY2ODc2MiZzaWc9NWZiYjljMjg3MTAzNGYwZDk4MDAyNGYzYzQ1N2E5MDg3YThjZDIxZjpzZXNzaW9uX2lkPTFfTVg0ME5qWTJPRGMyTW41LU1UVTROamMyTnpVMU9EUTROMzVYUm13dmRuTlJVbHBRZEVSak16UjNiMVJWUkdkd0wyRi1mZyZjcmVhdGVfdGltZT0xNTg2NzY3NTgwJm5vbmNlPTAuOTExNDY3NTY4Njk1NzA5NyZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTg3MzcyMzgwJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9";
$(document).ready(function ready() {
  $('#stop').hide();
  archiveID = null;

  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  $.get(SAMPLE_SERVER_BASE_URL + '/session', function get(res) {
    apiKey = res.apiKey;
    sessionId = res.sessionId;
    token = res.token;

    initializeSession();
  });
});

function initializeSession() {
  var session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function streamCreated(event) {
    var subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    session.subscribe(event.stream, 'subscriber', subscriberOptions, function callback(error) {
      if (error) {
        console.log('There was an error publishing: ', error.name, error.message);
      }
    });
  });

  session.on('archiveStarted', function archiveStarted(event) {
    archiveID = event.id;
    console.log('Archive started ' + archiveID);
    $('#stop').show();
    $('#start').hide();
  });

  session.on('archiveStopped', function archiveStopped(event) {
    archiveID = event.id;
    console.log('Archive stopped ' + archiveID);
    $('#start').hide();
    $('#stop').hide();
    $('#view').show();
  });

  session.on('sessionDisconnected', function sessionDisconnected(event) {
    console.log('You were disconnected from the session.', event.reason);
  });

  // Connect to the session
  session.connect(token, function connectCallback(error) {
    // If the connection is successful, initialize a publisher and publish to the session
    if (!error) {
      var publisherOptions = {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      };
      var publisher = OT.initPublisher('publisher', publisherOptions, function initCallback(err) {
        if (err) {
          console.log('There was an error initializing the publisher: ', err.name, err.message);
          return;
        }
        session.publish(publisher, function publishCallback(pubErr) {
          if (pubErr) {
            console.log('There was an error publishing: ', pubErr.name, pubErr.message);
          }
        });
      });
    } else {
      console.log('There was an error connecting to the session: ', error.name, error.message);
    }
  });
}

// Start recording
function startArchive() { // eslint-disable-line no-unused-vars
  $.ajax({
    url: SAMPLE_SERVER_BASE_URL + '/archive/start',
    type: 'POST',
    contentType: 'application/json', // send as JSON
    data: JSON.stringify({'sessionId': sessionId}),

    complete: function complete() {
      // called when complete
      console.log('startArchive() complete');
    },

    success: function success() {
      // called when successful
      console.log('successfully called startArchive()');
    },

    error: function error() {
      // called when there is an error
      console.log('error calling startArchive()');
    }
  });

  $('#start').hide();
  $('#stop').show();
}

// Stop recording
function stopArchive() { // eslint-disable-line no-unused-vars
  $.post(SAMPLE_SERVER_BASE_URL + '/archive/' + archiveID + '/stop');
  $('#stop').hide();
  $('#view').prop('disabled', false);
  $('#stop').show();
}

// Get the archive status. If it is  "available", download it. Otherwise, keep checking
// every 5 secs until it is "available"
function viewArchive() { // eslint-disable-line no-unused-vars
  $('#view').prop('disabled', true);
  window.location = SAMPLE_SERVER_BASE_URL + /archive/ + archiveID + '/view';
}

$('#start').show();
$('#view').hide();