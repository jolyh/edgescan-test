var expect = require('expect.js')
var PermissionDependencyResolver = require('../lib/permissionDependencyResolver')

describe('PermissionDependencyResolver', function() {

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

  it('validates whether permissions can be granted given simple dependencies', function(){
    pdr = new PermissionDependencyResolver(simplePermissionDependencies)
    expect(pdr.canGrant(['view'], 'edit')).to.be.ok()
    expect(pdr.canGrant(['view'], 'delete')).to.not.be.ok()
    expect(pdr.canGrant(['view', 'edit'], 'alter_tags')).to.be.ok()
    expect(pdr.canGrant(['view'], 'create')).to.be.ok()
  })

  it('can sort permissions in dependency order given simple dependencies', function(){
    pdr = new PermissionDependencyResolver(simplePermissionDependencies)

    expect(pdr.sort(['edit', 'delete', 'view'])).to.be.ok(['view', 'edit', 'delete'])

    possible_orderings = [
      ['view', 'edit', 'create', 'alter_tags'],
      ['view', 'create', 'edit', 'alter_tags']
    ]
    // either of the possible orderings are valid for this input
    expect(possible_orderings).to.be.ok(pdr.sort(['create', 'alter_tags', 'view', 'edit']))
  })

  it('validates whether permissions can be denied given simple dependencies', function(){
    pdr = new PermissionDependencyResolver(simplePermissionDependencies)

    expect(pdr.canDeny(['view', 'edit'], 'view')).to.not.be.ok()
    expect(pdr.canDeny(['view', 'edit'], 'edit')).to.be.ok()
    expect(pdr.canDeny(['view', 'edit', 'create'], 'edit')).to.be.ok()
    expect(pdr.canDeny(['view', 'edit', 'delete'], 'edit')).to.not.be.ok()
  })

  it('validates whether permissions can be granted given complex dependencies', function(){
    pdr = new PermissionDependencyResolver(complexPermissionDependencies)

    expect(pdr.canGrant(['view', 'edit', 'delete'], 'batch_update')).to.not.be.ok()
    expect(pdr.canGrant(['view', 'edit', 'create'], 'batch_update')).to.be.ok()
    expect(pdr.canGrant(['view', 'edit', 'delete'], 'audit')).to.not.be.ok()
    expect(pdr.canGrant(['view', 'edit', 'delete', 'create'], 'audit')).to.be.ok()
  })

  it('throws an exception when validating permissions if existing permissions are invalid', function(){
    pdr = new PermissionDependencyResolver(complexPermissionDependencies)

    expect(function () { pdr.canGrant(['edit', 'create'], 'alter_tags') }).to.throwError("Invalid Base Permissions")
    expect(function () { pdr.canGrant(['view', 'delete'], 'alter_tags') }).to.throwError("Invalid Base Permissions")
    expect(function () { pdr.canDeny(['create', 'delete'], 'audit') }).to.throwError("Invalid Base Permissions")
  })

  it('can sort permissions in dependency order given complex dependencies', function(){
    pdr = new PermissionDependencyResolver(complexPermissionDependencies)
    possible_orderings = [
      ['view', 'edit', 'create', 'delete', 'audit'],
      ['view', 'create', 'edit', 'delete', 'audit'],
      ['view', 'edit', 'delete', 'create', 'audit']
    ]

    expect(possible_orderings).to.be.ok(pdr.sort(['audit', 'create', 'delete', 'view', 'edit']))
  })

})
