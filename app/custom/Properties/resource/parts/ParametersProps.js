import {
    getBusinessObject
  } from 'bpmn-js/lib/util/ModelUtil';
  
  import {
    createElement, 
    createParameters,
    getParameters,
    getParametersExtension,
    nextId
  } from '../util';
  
  import ParameterProps from './ParameterProps';
  
  import { without } from 'min-dash';
  
  
  export default function ParametersProps({ element, injector }) {
  
    const parameters = getParameters(element) || [];
  
    /*const bpmnFactory = injector.get('bpmnFactory'),
          commandStack = injector.get('commandStack');*/
    const bpmnFactory = injector.get('bpmnFactory'),
      commandStack = injector.get('commandStack');

    const items = parameters.map((parameter, index) => {
      const id = element.id + '-parameter-' + index;
      // перебераем подключённые ресурсы (parameter = resource в бизнесОбджект)
      return {
        id,
        label: parameter.resourceRef.name,
        autoFocusEntry: id + '-name',
        entries: ParameterProps({
          idPrefix: id,
          element,
          parameter
        }),
        remove: removeFactory({ commandStack, element, parameter })// кнопки для удаления
      };
    });
  
    return {
      items,
      add: addFactory({ element, bpmnFactory, commandStack}) // кнопка добавления 
    };
  }
  
  function removeFactory({ commandStack, element, parameter }) {
    return function(event) {
      
      event.stopPropagation();
  
      const resource = getParameters(element); // получаем список всех подключённых к обьекту ресурсов
      if (!resource) {
        return;
      }
      const parametersnew = without(resource, parameter);
      element.businessObject.resources = parametersnew //Удаляем из глобального обьекта
      
      // каким то образом обновляем панель свойств
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: resource,
        resources: parametersnew
      });
    };
  }
  
  function addFactory({ element, bpmnFactory, commandStack}) {
    return function(event) {
      
      event.stopPropagation();
      
  
      const commands = [];
  
      const businessObject = getBusinessObject(element);
  
      let resources = businessObject.resources;
      // (1) ensure extension elements
      if (!resources) {
        businessObject.resources = []
        /*
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: businessObject,
            resources: businessObject.resources
          }
        });*/
      }

      // (2) ensure parameters extension
      const resourcenew = getParameters(element); 
      
      
      const NewPerformer = createElement('bpmn:Performer', {
        id: businessObject.id + "_RES_0",
        resourceRef: Object
      }, resources, bpmnFactory);
      resourcenew.push(NewPerformer)
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject.resources,
        resources: resourcenew
      });
      
  
      //commandStack.execute('properties-panel.multi-command-executor', commands);
    };
  }