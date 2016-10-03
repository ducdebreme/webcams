// vue.js

function get_property(cam) {
  return _.isEmpty(cam.property) ? '' : '(' + _.pluck(cam.property, 'name').join(', ') + ')';
}


var vue;
vue = new Vue({
  el: '#vue',
  ready: function () {
    console.log('vue init');
  },
  data: {
    test: 'hallo',
    result: {}
  }
});


// google map
var infowindow_template = _.template(
  $("script.template").html()
);

var coords = {
  lng: 12.338511,
  lat: 45.434372
}

var map;
function initMap() {
  var markers = [], webcams = [];

  map = new google.maps.Map(document.getElementById('map'), {
    center: coords,
    zoom: 15
  });

  // handler for map changes (move, zoom, center)
  var change_handler = _.throttle(function () {
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var args = [ne.lat(), ne.lng(), sw.lat(), sw.lng()];

    $.ajax({
      url: 'https://webcamstravel.p.mashape.com/webcams/list/bbox=' + args.join(',') + '/limit=40',
      headers: {
        'X-Mashape-Key': 'KKvIqM0OYWmshUSBsRWThi0CQPSUp1G0mPZjsnUDkexjWkIGIj',
      },
      method: 'GET',
      data: {
        show: 'webcams:location,image,property,url,user'
//          show: 'webcams:location,image,map,property,statistics,timelapse,url,user'
      },
      dataType: 'json',
      success: function (data) {
        console.log(data.result);
        if (data.status == 'OK') {
          webcams = data.result.webcams;
          update_cams();
          vue.result = data.result;
        }
      }
    });

  }, 500);


  var update_cams = function () {
    // delete previous markers
    if (!_.isEmpty(markers)) {
      _.each(markers, function (marker) {
        marker.setMap(null);
      })
      console.log('deleted');
    }

    // attach cam images
    markers = _.map(webcams, function (cam) {

      var icon_size = 'thumbnail';
      var size = cam.image.sizes[icon_size];

      var image = new google.maps.MarkerImage(
        cam.image.current[icon_size], null, null, null,
        new google.maps.Size(size.width / 4, size.height / 4)
      );

      // add icon marker
      var marker = new google.maps.Marker({
        position: {
          lng: cam.location.longitude,
          lat: cam.location.latitude
        },
        map: map,
        title: cam.title,
        icon: image
      });

      var property = get_property(cam);
      var infowindow = new google.maps.InfoWindow({
        content: infowindow_template({cam: cam, prop: property})
      });

      marker.addListener('click', function () {
        infowindow.open(map, marker);
      });

      return marker;
    });
    console.log(markers.length);
  }

// zoom_changed  center_changed
  map.addListener('bounds_changed', change_handler);
  map.addListener('zoom_changed', change_handler);


}


