var rcu = require( 'rcu' );
var builders = require( 'rcu-builders' );
var Ractive = require('ractive');
rcu.init( Ractive );
var fs = require('fs');
var through = require('through2');
var gulputil = require('gulp-util');
var PluginError = gulputil.PluginError;

const PLUGIN_NAME = 'gulp-ractive-builder';


function gulpRactiveBuilder(options)
{

  var stream = through.obj(function(file, enc, callback) {
    if (file.isStream())
        {
          this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
          return callback();
        }
      var builder = builders[ options.type || 'amd' ];
      if ( !builder ) {
        this.emit('error', new Error( 'Cannot convert Ractive component to "' + options.type + '". Supported types: ' + Object.keys( builders ) ));
        return callback();
      }
      options.sourceMap = options.sourceMap !== false;
      Ractive.defaults = {
        accept: '.html',
        ext: '.js'
      };

  
    var filecontents = "";
    
    try {
      filecontents = String(file.contents);
      if ( options.sourceMap ) {
        options.sourceMapFile = file.path + '.map';
        options.sourceMapSource = file.path;
      }  
      
      console.log (`Building file: ${file.path} `);
      filecontents =  builder( rcu.parse( filecontents   ), options );
      console.log(filecontents);
      
      file.contents = new Buffer(filecontents.code);
            console.log (`made buffer `);
     callback(null,file);
    }



    catch (e) {
      console.warn('Error caught from ractive component build: ' +
        e.message + ' in ' + file.path + '. Returning uncompiled template');
      this.push(file);
      return callback(e);
    }
    
  });

    
  return stream;
}

module.exports = gulpRactiveBuilder;
