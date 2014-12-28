/**
 * Stubs for use in tests
 * A GPG key must be generated for 
 */
var stubs = {};

/*************************
 **   DATA MODEL STUBS  **
 *************************/
stubs.dataModelStub = function postStub() {
  return {
    displayName: 'Test Data Model',
    fileSafeName: 'test_data_model'
  }
}

stubs.dataModelStub2 = function postStub() {
  return {
    displayName: 'Test Data Model 2',
    fileSafeName: 'test_data_model_2'
  }
}

/**************************
 **      USER STUBS      **
 **************************/
stubs.userStub = function createUser() {
  return {
    id: '111111',
    firstName: 'John',
    lastName: 'Johnson',
    email: 'john.johnson@berkeley.edu',
    publicKey: testGPGKey,
    publicKeyID: '13779E47'
  }
}

stubs.userStub2 = function createUser() {
  return {
    id: '222222',
    firstName: 'Kevin',
    lastName: 'Chan',
    email: 'kevin.chan@berkeley.edu',
    publicKey: testGPGKey,
    publicKeyID: '13779E47'
  }
}

var testGPGKey = "-----BEGIN PGP PUBLIC KEY BLOCK-----" +
"Version: GnuPG v1" +
"" + 
"mQENBFSdIf4BCADATizHrS35lAsfqgI2PkvQoTUZSq+T0eSjmDjw0hrSChC+UpzW" + 
"l8Vqr/hVz3nhT9yVP+pyQhaWXDlGERmWej7rYW0JickunYvhM8D0RLRe7eXAYHQG" + 
"lWZimdOs9jarcnfh1cB94wgT8bgcEvgwmnHDpKwF/iVL7XTpUbwjGuQ5uNYqwM1w" + 
"nFpgr9tF9KRqqUJOpdzrr9LeIn+FtbP6l/WrYBn4+mmC203JXaV+7B0HQjHNIKUT" + 
"k4jJSrrMEmb2IkRRur5wA3f7QTDtb5XBkEpCrL8CA74LE8WXopK1fQpb82OmnqUV" + 
"OSrUdpzqRZk6UgBga5JCjkTVeFirtpJdxkm1ABEBAAG0OkpvaG4gSm9obnNvbiAo" + 
"bW9vY1JQIHRlc3Qga2V5KSA8am9obi5qb2huc29uQGJlcmtlbGV5LmVkdT6JATgE" + 
"EwECACIFAlSdIf4CGwMGCwkIBwMCBhUIAgkKCwQWAgMBAh4BAheAAAoJECGa274T" + 
"d55HqtUIAJQkxNYs7OKBPRYxVBURD1A9XSKAJBoJPSfEo95Gh8kCZRTK0yvoFVT4" + 
"vZBclFLIsg4mJ69sYboXRha4onpdOQkriCP4nG+kIgpcKO6fBYthvCsAUpR0Rz22" + 
"+BOBZFATYcytbSaKqhDg80F++MbDUd8ImiCbWtIfjfWRydn+YXatJ36zkX3wiJsh" + 
"wKOsvlcxwlc5V4MfPM2P7mRgYr+ger+FutBldPSdfsH+yJuAlQC3D2rw4q2SekS/" + 
"ud4baPnTD2+q6xNNQcP69/zUkz2q8Y0pmYqjDis9Cr3pWOJUgZ3vcUF3adRynMLC" + 
"8kGHwfHZDhfTnbfNuDXbM2/JTMTIYse5AQ0EVJ0h/gEIAJ5DfkkkG7kGry77A0Y0" + 
"lKsm0FMeshhdH7FHfpTdtRhPLamZVtUxABETbtTiaU7n4H4PxWmZ7CZriZpoZcf8" + 
"2+58JVhx2aNmJYjizdoY28XyOT+E+JhQgU7uxwUOaeGK0l3JU9fr0ynBCXY/Zv/M" + 
"/jsx6qFueYPVHZzHsdD1hZ9Sp3OdCKIlptbWq6fwnN0ZvehvHuzpNM6ybH9d8+LT" + 
"usZYQ49a2YUqHvsAKtHiEPOIXjj5D13r1sMXDnzowBsgRL3ARqYLphGUe6xwYpDa" + 
"qy5Z4Rj7LSjTd/koYL0gFLSYPFIBWxneWMsK45OYCo2/t6aXrjKYtbghgzV7hA85" + 
"MlUAEQEAAYkBHwQYAQIACQUCVJ0h/gIbDAAKCRAhmtu+E3eeR1JpB/wOKl/rwVLn" + 
"PFFp8ikrNZQaHG1Ycch9mX0UXjoaKlpta7W67dP2MBZmhMDK6fu9qHHpXeS7MwWp" + 
"jshZ3c30dOSNbeP/FkWOfg7vjHeix3KoeoaQoBmVO0WreWjm8JTsCtN7dOQQG1Ui" + 
"nbd44hBdQrnwudMl7kGV/kDYdQql5Luqtqlnzenthc+eR67DLTD7Q/K0HtZduvz3" + 
"h1BN1GSrkentod23Jp8+H0HXtEO3ddzl9qMWAlOjVJneSW5fCZMPlpsr8LHZf3mV" + 
"zp9YQwspPuwiPooKLKm775J6s+BrFlsszXo5DF8XDmzTMSl9SSqxQB1O93YUJzHr" + 
"Ai/xmb5/2vO0" + 
"=r0uC" + 
"-----END PGP PUBLIC KEY BLOCK-----";

module.exports = stubs;