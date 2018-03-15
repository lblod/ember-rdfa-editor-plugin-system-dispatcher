import { warn } from '@ember/debug';
import Service, { inject } from '@ember/service';
import { A } from '@ember/array';
import { camelize, dasherize } from '@ember/string';
import RSVP from 'rsvp';
import editorProfiles from '../config/editor-profiles';

// Return all plugins mentioned in any supplied profile
function calculateAllPlugins( profiles ) {
  let profileArrays = [];
  for( var key in profiles )
    profileArrays = [...profileArrays, ...profiles[key]];

  return A(profileArrays).uniq();
}

// Build a variable name for a given plugin name
// This name is unique in the class
function variableNameForPlugin( pluginName ) {
  return "_p_" + camelize(pluginName);
}

// Standard body of our service
let service = {

  /**
  * Dispatch an event to all plugins of a given profile
  *
  * @method dispatch
  *
  * @param {string} profile Editor profile
  * @param {Object} hintsRegistryIndex Unique identifier of the event in the hints registry
  * @param {Array} contexts RDFa contexts of the text snippets the event applies on
  * @param {Object} hintsRegistry Registry of hints in the editor
  * @param {Object} editor The RDFa editor instance
  *
  * @return {Promise} A promise that resolves when the event has been dispatched to the plugins
  *
  */
  dispatch(profile, hintsRegistryIndex, contexts, hintsRegistry, editor){
    let self = this;
    return new RSVP.Promise(function(resolve){

      const plugins = editorProfiles[profile];

      if( plugins ){
        plugins.forEach( (plugin) => {
          self.get( variableNameForPlugin( plugin ) ).execute(hintsRegistryIndex, contexts, hintsRegistry, editor);
        });
      } else {
        warn(`Editor plugin profile "${profile}" was not found`);
      }

      resolve();

    });
  }

};

// Add the plugin's services to this service
let allPlugins = calculateAllPlugins( editorProfiles );
allPlugins.forEach( (p) => {
  service[variableNameForPlugin(p)] = inject(dasherize(p));
} );


/**
* RDFa Editor system dispatcher that dispatches editor events to the configured plugins
*
* @module editor-core
* @class RdfaEditorDispatcher
* @extends Service
*/
export default Service.extend( service );
