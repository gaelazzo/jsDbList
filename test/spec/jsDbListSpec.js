/*globals describe,beforeEach,it,expect,jasmine,spyOn,afterEach,xit */
/* jshint node:true */

'use strict';
var path = require("path");
var DataAccess = require('jsDataAccess');
/**
 *
 * @type {Deferred}
 */
var Deferred = require("JQDeferred");


var dbList = require('../../src/jsDbList');
var DbDescriptor = dbList.DbDescriptor;

/**
 * @type fs
 */
var fs = require('fs');

var _ = require('lodash');

/**
 * *****************************************************************************************
 * VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT VERY IMPORTANT
 * *****************************************************************************************
 * It's necessary, before start running the test, to create a file templated like:
 *  { "server": "db server address",
 *    "dbName": "database name",  //this must be an EMPTY database
 *    "user": "db user",
 *    "pwd": "db password"
 *  }
 */
//PUT THE  FILENAME OF YOUR FILE HERE:


var configName = path.join('test', 'db.json');
var dbConfig;
if (process.env.TRAVIS){
    dbConfig = { "server": "127.0.0.1",
        "dbName": "test",
        "user": "root",
        "pwd": ""
    };
}
else {
    dbConfig = JSON.parse(fs.readFileSync(configName).toString());
}
/**
 * setup the dbList module
 */
dbList.init({
    encrypt: false,
    decrypt: false,
    encryptedFileName: path.join('test', 'dbList.bin')
});

var good = {
    server: dbConfig.server,
    useTrustedConnection: false,
    user: dbConfig.user,
    pwd: dbConfig.pwd,
    database: dbConfig.dbName,
    sqlModule: 'jsMySqlDriver'
};


describe('setup dataBase', function () {
    var sqlConn;
    beforeEach(function (done) {
        dbList.setDbInfo('test', good);
        sqlConn = dbList.getConnection('test');
        sqlConn.open().done(function () {
            done();
        });
    }, 10000);

    afterEach(function () {
        if (sqlConn) {
            sqlConn.destroy();
        }
        sqlConn = null;
    });


    it('should run the setup script', function (done) {
        sqlConn.run(fs.readFileSync(path.join('test', 'setup.sql')).toString())
            .done(function () {
                expect(true).toBeTruthy();
                done();
            })
            .fail(function (res) {
                expect(res).toBeUndefined();
                done();
            });
    }, 30000);

});

describe('dbDescriptor ', function () {
    var sqlConn,
        dbDescr;


    beforeEach(function (done) {
        sqlConn = dbList.getConnection('test');
        dbDescr = new DbDescriptor(sqlConn);
        sqlConn.open().done(function () {
            done();
        });
    });

    afterEach(function () {
        if (sqlConn) {
            sqlConn.destroy();
        }
        sqlConn = null;
    });


    describe('table descriptor', function () {
        it('tableDescriptor should be a method', function () {
            expect(sqlConn.tableDescriptor).toEqual(jasmine.any(Function));
        });

        it('tableDescriptor should return an object when table exists', function (done) {
            sqlConn.tableDescriptor('customer')
                .done(function (p) {
                    expect(p).toEqual(jasmine.any(Object));
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('tableDescriptor should fail when table does not exist', function (done) {
            sqlConn.tableDescriptor('customer_no')
                .done(function (p) {
                    expect(p).toBeUndefined();
                    done();
                })
                .fail(function (err) {
                    expect(err).toContain('does not exist');
                    done();
                });

        });


        it('tableDescriptor should return an object with columns array, name and xtype', function (done) {
            dbDescr.table('customer')
                .done(function (p) {
                    expect(p.name).toEqual('customer');
                    expect(p.xtype).toEqual('T');
                    expect(p.columns).toEqual(jasmine.any(Array));
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('tableDescriptor should return an object with all columns', function (done) {
            dbDescr.table('customer')
                .done(function (p) {
                    expect(_.find(p.columns, {name: 'age'}).type).toEqual('int');
                    expect(_.find(p.columns, {name: 'idcustomer'}).type).toEqual('int');
                    expect(_.find(p.columns, {name: 'idcustomerkind'}).type).toEqual('int');
                    expect(_.find(p.columns, {name: 'name'}).type).toEqual('varchar');
                    expect(_.find(p.columns, {name: 'birth'}).type).toEqual('datetime');
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });


        it('tableDescriptor should have a key', function (done) {
            dbDescr.table('customer')
                .done(function (p) {
                    expect(p.getKey).toEqual(jasmine.any(Function));
                    expect(p.getKey()).toEqual(jasmine.any(Array));
                    expect(p.getKey()[0]).toEqual('idcustomer');
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

        it('A view should not have a key', function (done) {
            dbDescr.table('customerview')
                .done(function (p) {
                    expect(p.getKey).toEqual(jasmine.any(Function));
                    expect(p.getKey()).toEqual(jasmine.any(Array));
                    expect(p.getKey().length).toEqual(0);
                    done();
                })
                .fail(function (err) {
                    expect(err).toBeUndefined();
                    done();
                });
        });

    });


});


describe('dbList', function () {

    it('dbList should be defined', function () {
        expect(dbList).toBeDefined();
    });

    it('dbList should be a object', function () {
        expect(dbList).toEqual(jasmine.any(Object));
    });


    it('dbList() should define getDbInfo', function () {
        expect(dbList.getDbInfo).toBeDefined();
    });

    it('dbList() should define setDbInfo', function () {
        expect(dbList.setDbInfo).toBeDefined();
    });
});


describe('destroy dataBase', function () {
    var sqlConn;

    beforeEach(function (done) {
        dbList.setDbInfo('test', good);
        sqlConn = dbList.getConnection('test');
        sqlConn.open().done(function () {
            done();
        });
    }, 10000);

    afterEach(function () {
        dbList.delDbInfo('test');
        if (sqlConn) {
            sqlConn.destroy();
        }
        sqlConn = null;
        if (fs.existsSync('test/dbList.bin')) {
            fs.unlinkSync('test/dbList.bin');
        }
    });

    it('should run the destroy script', function (done) {
        sqlConn.run(fs.readFileSync(path.join('test', 'destroy.sql')).toString())
            .done(function () {
                expect(true).toBeTruthy();
                done();
            })
            .fail(function (res) {
                expect(res).toBeUndefined();
                done();
            });
    }, 30000);

});