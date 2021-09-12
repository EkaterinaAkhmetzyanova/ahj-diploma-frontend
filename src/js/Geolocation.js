/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-alert */
export default class Geolocation {
  getGeoPermission() {
    if (!navigator.geolocation) {
      return new Promise((resolve, reject) => reject(new Error('There is no GEO API')));
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        resolve(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        console.log(latitude, longitude);
      }, (error) => {
        if (error.code === 1) {
          alert('Please give a permission to show your geolocation');
        }
        reject(error);
      });
    });
  }

  // geoValidity(geolocation) {
  //   if (geolocation.match(/[^0-9[\]-\s.,]/g)) {
  //     // throw new Error('error');
  //     return false;
  //   }
  //   const pos = geolocation.replace(/[[\]\s+]/g, '');
  //   const arr = pos.split(',');
  //   if (!arr[0] || !arr[1]) {
  //     return false;
  //   }
  //   console.log(arr);
  //   const latitude = Number(arr[0]);
  //   const longitude = Number(arr[1]);
  //   return [latitude, longitude];
  // }
}
