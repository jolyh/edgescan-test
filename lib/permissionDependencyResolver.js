var tsort = require('tsort') // HINT!!! This is a useful package for one of the methods

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
  this.dependencies = dependencies
  /*console.log('====================================');
  console.log(this.dependencies);
  console.log('====================================');*/
}

PermissionDependencyResolver.prototype.canGrant = function(existing, permToBeGranted) {
  //console.log("to be granted : " + permToBeGranted)
  var result = 0;
  existing.forEach(existingPermission => {
    if (this.dependencies[existingPermission].length > 0) {
      this.dependencies[existingPermission].forEach(element => {
        if (existing.indexOf(element) < 0) {
          throw new InvalidBasePermissionsError
        }
      })
    }
    if (this.dependencies[permToBeGranted].indexOf(existingPermission) > -1) {
      result++
      //console.log("nbr de permission correspondantes : " + result)
    }
  })
  //console.log("nbr de permission requises : " + this.dependencies[permToBeGranted].length)
  //console.log("to be granted: " + permToBeGranted + ", require -> " + this.dependencies[permToBeGranted])
  if (result === this.dependencies[permToBeGranted].length) {
    //console.log("OK !!!")
    return true
  }  else {
    //console.log("KO")
    return false
  }
}

PermissionDependencyResolver.prototype.canDeny = function(existing, permToBeDenied) {
  //console.log("to be denied : " + permToBeDenied)
  var checked = 0
  existing.forEach(existingPermission => {
    if (this.dependencies[existingPermission].length > 0) {
      this.dependencies[existingPermission].forEach(element => {
        if (existing.indexOf(element) < 0) {
          throw new InvalidBasePermissionsError
        }
      })
    }
    if (this.dependencies[existingPermission].indexOf(permToBeDenied) > -1) {
      //console.log(permToBeDenied + " used elsewhere -> " + existingPermission)
      return false
    }
    checked++
  })
  if (checked === existing.length) {
    //console.log(permToBeDenied + " can be denied")
    return true
  }
}

PermissionDependencyResolver.prototype.sort = function(permissions) {
  var graph = new tsort()
  var result = []
  permissions.forEach(permission => {
    if (!permission in this.dependencies) {
      throw new InvalidBasePermissionsError
    }
    if (this.dependencies[permission].length > 0) {
      this.dependencies[permission].forEach(element => {
        graph.add(element, permission)
      })
    }
  })
  //console.log(graph);
  return graph.sort()
}

// you'll need to throw this in canGrant and canDeny when the existing permissions are invalid
function InvalidBasePermissionsError() {
  this.name = 'InvalidBasePermissionsError'
  this.message = "Invalid Base Permissions"
  this.stack = Error().stack
}
InvalidBasePermissionsError.prototype = new Error()

module.exports = PermissionDependencyResolver