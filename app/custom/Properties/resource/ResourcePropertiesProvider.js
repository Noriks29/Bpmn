// Import your custom list group entries.
import parametersProps from './parts/ParametersProps';

// Import the properties panel list group component.
import { ListGroup } from '@bpmn-io/properties-panel';

import { is } from 'bpmn-js/lib/util/ModelUtil';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function ResourcePropertiesProvider(propertiesPanel, injector, translate) {

  // API ////////

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function(groups) {

      if (is(element, 'bpmn:Task')) {
        groups.push(createParametersGroup(element, injector, translate));
      }

      return groups;
    };
  };


  // registration ////////

  // Register our custom magic properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

ResourcePropertiesProvider.$inject = [ 'propertiesPanel', 'injector', 'translate' ];

// Create the custom parameters list group.
function createParametersGroup(element, injector, translate) {

  // Create a group called "parameters".
  //console.log(element, injector, translate)
  const parametersGroup = {
    id: 'Resources',
    label: translate('Resources'),
    component: ListGroup,
    ...parametersProps({ element, injector })
  };

  return parametersGroup;
}