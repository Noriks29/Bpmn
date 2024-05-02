// Import your custom property entries.

import GetwayProps from './parts/GetwayProps';

import { is } from 'bpmn-js/lib/util/ModelUtil';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function GetwayPropertiesProvider(propertiesPanel, translate) {

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

      if (is(element, 'bpmn:ParallelGateway')) {
        groups.push(createGroup(element, translate));
      }
      else if (is(element, 'bpmn:ExclusiveGateway')) {
        groups.push(createGroup(element, translate));
      }
      else if (is(element, 'bpmn:InclusiveGateway')) {
        groups.push(createGroup(element, translate));
      }
      

      return groups;
    };
  };

  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

GetwayPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];


function createGroup(element, translate) {

  const LtsmGroup = {
    id: 'Getway',
    label: translate('Режим шлюза'),
    entries: GetwayProps(element),
    tooltip: translate('Make sure you know what you are doing!')
  };

  return LtsmGroup;
}