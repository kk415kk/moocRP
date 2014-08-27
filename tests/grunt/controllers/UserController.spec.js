var Sails = require('sails'), 
    UserController = require('../../../api/controllers/UserController'),
    testHelper = require('../specHelper.js');

var samplePublicKey = 
    "-----BEGIN PGP PUBLIC KEY BLOCK----- \
    Version: GnuPG v1 \
     \
    mQENBFPpbJUBCAC0cTefWyiCb01qelwQA7lDg9qjpTZ276vBB7lK5u2bhTwMUJUi \
    8GhqXUtyY/vfhIJ9I30jEt7G7MzXlBfqhfeevkKN/ySOVVKOt8SscPJ7S4DZ6weP \
    YuEG2XLmHAdh35iQCgKuiIfXctebpXsA2TZlMZcphuFQg/SobR13HnkVYVcrhxCE \
    Hpg07DiI3TH6oGybcgNL7Fq8aZV6OGOHjwjTMjmptan+Phay+UiD4IFe90mQLM35 \
    eww5fRb6Oq0/ZKTj0QtN9eLyptVVD6ComP1+02blrNAT2W42hyVDEtvjMJyMkRBq \
    QzmwFrKWobFT5Y/oRgCOYeDnq/C5vlcLv3gZABEBAAG0MUtldmluIEthbyAoSHVz \
    a2llcyBhcmUgY29vbCEpIDxrazQxNWtrQGdtYWlsLmNvbT6JATgEEwECACIFAlPp \
    bJUCGwMGCwkIBwMCBhUIAgkKCwQWAgMBAh4BAheAAAoJEG9WrNsGwpHBiFEH/0sr \
    VyeSpkRCYINuTR0byrEK1HjGJGh07gfn/6Yer+8teIGLxruBYcNuKnhkqC1LnSx/ \
    FuJ0FCz7JEC6eMOVRIJpWviveSiDUH4SM2fltz1IIKQ61s9qxEMl2SJezrMaqPk3 \
    oyYq96o83qGP+d10yUMt11A7/8TdzDQnj62eeYr9djfB5IOAMukEOJqp0WEXqyjq \
    ouv2vyHa4lNtWJ5u4lUwmCeqBBxGjPa+DQSOBXvAoy2WqNZRkVo/fyd1ud8IjgKv \
    9CT6wCCBFYZPThAc2SFvjgOkf0MDPUK+smdknYeb1sqNb3W6oysl2F5EE2KCxAoy \
    /WtGTfGvs8qlKoJdrCK5AQ0EU+lslQEIALUVR5mlBHMzR9+74WByxa/IhggR/DXR \
    g/09MOBAnXXPFp17NkPh6XUb0h9R8T5cDmpdp/0ibggUSLSKTliV7HjtiH9eQ+hm \
    pYecQkrYGd2FPlRoWcun7IraaM2xwSFUu8cftOQydp+o66LKpIhl7KwsgzK9zpu6 \
    L9g2zLyApgLs62e9F0RDFgTS11W2m3RKKNzQ81jA8Yu2At2G1mCyfs826kKZzKYu \
    cgpauuS8UJ17MLZISOlNnd752Z83FySdzs77zVoZKnnvZk8yfJMkBqwB3DHuEWWC \
    yclWS0NZqUP0NKnndKw8aL5lsRgyPLvZB4mLP8x5wdpfzw2YtKCo4kcAEQEAAYkB \
    HwQYAQIACQUCU+lslQIbDAAKCRBvVqzbBsKRwZd4B/9ycJ3nrTWkJK5J90d+dIYb \
    VpR8P9y0EOygIlgxB879L9TGeMGW4NRBean2TyVHABY5xvr25eq299NGI5lKw5gp \
    Xx2rC0j6YhtnIA9yIIFtMMjUOkfj24P9jXb2iTV2+I5kbLQL2K3+5nS8PthpWKya \
    kKCfS2HKKdNSit7gVdCf78QRUCoP1LpNS0JGK0qSgMTlzdc7pNi75RbSviw15xhQ \
    Mkd0sJqcWBJFQtBSeR1rsSu3AoWtyXF7EMcvMeu+pae5wwySqk8D5BwNJoqm0xPY \
    serHTFr4VK7rgd6pfsZLyoEqNwcYsdyF8RXh87v5XqaL7DHpRJw0BR0U6lxCQ+5u \
    =L3vy \
    -----END PGP PUBLIC KEY BLOCK-----";

var userCreationParams = {
  id: '1010',
  firstName: 'John',
  lastName: 'Baker',
  email: 'john.baker@berkeley.edu',
  publicKeyID: '06C291C1',
  publicKey: samplePublicKey
}

var badUserCreationParams = {
  id: '1010',
  firstName: 'John',
  lastName: 'Baker',
  email: 'john.baker@stanford.edu',
  publicKeyID: '06C291C1',
  publicKey: samplePublicKey
}

describe('UserController', function () {
  describe('when we create a user that is not an @berkeley.edu email address', function () {
    it ('should not create the user', function () {
      UserController.create(badUserCreationParams, function (err, user) {
        assert.notEqual(err, undefined);
        done();
      });
    });
  });
});