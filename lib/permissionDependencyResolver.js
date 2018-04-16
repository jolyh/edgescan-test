var tsort = require('tsort') // HINT!!! This is a useful package for one of the methods

/*
var simplePermissionDependencies = {
  view: [],
  edit: ['view'],
  alter_tags: ['edit'],
  create: ['view'],
  delete: ['edit']
}

var complexPermissionDependencies = Object.assign({
audit: ['create', 'delete'],
batch_update: ['edit', 'create']
}, simplePermissionDependencies)
*/

function PermissionDependencyResolver (dependencies) {
  var set
  for (key in dependencies) {
    dependencies[key].forEach(permission => {
      if (permission in dependencies) {
        Array.prototype.push.apply(dependencies[key], dependencies[permission])
      }
    });
    set = new Set(dependencies[key])
    dependencies[key] = Array.from(set)
  }
  this.dependencies = dependencies;
  /*console.log('====================================');
  console.log(this.dependencies);
  console.log('====================================');*/
}

PermissionDependencyResolver.prototype.canGrant = function(existing, permToBeGranted) {
  if (existing === null || permToBeGranted === null || permToBeGranted === []) {
    console.log("no argument");
    throw new InvalidBasePermissionsError
  } else if (permToBeGranted in this.dependencies) {
    console.log("dans les perm")
    var existingSet = new Set(existing)
    var result = 0;
    existing.forEach(existingPermission => {
      if (!existingPermission in this.dependencies) {
        throw new InvalidBasePermissionsError
      }
      if (this.dependencies[permToBeGranted].indexOf(existingPermission) > -1) {
        result++
        console.log("nbr de permission correspondantes : " + result);
      }
    })
    console.log("nbr de permission requises : " + this.dependencies[permToBeGranted].length);
    console.log(permToBeGranted + " -> " + this.dependencies[permToBeGranted]);
    if (result === this.dependencies[permToBeGranted].length) {
      console.log("OK !!!")
      return true
    } else {
      console.log("KO")
      return false
    }
  } else {
    throw new InvalidBasePermissionsError
  }
}

PermissionDependencyResolver.prototype.canDeny = function(existing, permToBeDenied) {
  if (existing === null || permToBeGranted === null || permToBeGranted === []
    || existing.indexOf(permToBeDenied) > -1) {
    console.log("no argument");
    throw new InvalidBasePermissionsError
  }
}

PermissionDependencyResolver.prototype.sort = function(permissions) {

}

// you'll need to throw this in canGrant and canDeny when the existing permissions are invalid
function InvalidBasePermissionsError() {
  this.name = 'InvalidBasePermissionsError'
  this.message = "Invalid Base Permissions"
  this.stack = Error().stack;
}
InvalidBasePermissionsError.prototype = new Error()

module.exports = PermissionDependencyResolver
