import {SelectEntry} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';



export default function ParameterProps(props) {

  const {
    idPrefix,
    element,
    parameter
  } = props;
  //console.log("props", props)
  const entries = [
    {
      id: idPrefix + '-ResourceRef',
      element,
      component: ResourceSelect,
      parameter
    }
  ];

  return entries;
}

function ResourceSelect(props) {
  const { element, id, parameter } = props;
  const moddle = useService('moddle');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  // бегаем по дереву обьектов в поиске глобального списка ресурсов
  
  const RootElement = element.businessObject.$parent.$parent.rootElements
  const Resource = parameter
  //console.log(RootElement)
  const ResourceList = []

  RootElement.forEach(element => {
    if(element.$type === "bpmn:Resource")
    {
      //console.log(element.name)
      if(element.id != undefined && element.name != undefined)
        ResourceList.push({value: element.id, label: element.name})
    }
  });
  //console.log(ResourceList)

  function updateValues(value){
    Resource.resourceRef = value
    modeling.updateProperties(element, {}); // презагружаем обьект свойст без параметров
    return value
  }

  const getMode = () => {
    const ResourceRef = parameter.resourceRef.id
    return ResourceRef;
  };

  const setMode = value => {
    //console.log("setResRef", value)
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == value)
      {
        const ResourceRef = element
        return updateValues(ResourceRef)
      }
    });
  };

  const getOptions = () => {
    return ResourceList
  };

  return SelectEntry({
  id: id,
  element: element,
  label: translate('ResourceRef'),
  getOptions: getOptions,
  getValue: getMode,
  setValue: setMode,
  debounce
  });
}