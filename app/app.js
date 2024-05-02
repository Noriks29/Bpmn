import BpmnModeler from 'bpmn-js/lib/Modeler';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel'; //для панели свойств4

import minimapModule from 'diagram-js-minimap';


import diagramXML2 from '../resources/monsg.bpmn'; // путь к заготовке схемы
import diagramXML from '../resources/monsg_test.bpmn'; // путь к заготовке схемы

import customModule from './custom'; // папка с надстройками bpmn-js

import qaExtension from '../resources/qa'; // подгрузка кастмных моделей обьекта qa
import ltsmExtension from '../resources/ltsm'; // подгрузка кастомных моделей обьекта list

import resourcePropertiesProvider from './custom';
import ltsmPropertiesProvider from './custom';

const buttonSaveXML = document.querySelector('.button_save');
const buttonShowResource = document.getElementById('resource_panel');

const ResourceList = document.getElementById("resource-list");
const ResourceEdit = document.getElementById("resource-edit");

const HIGH_PRIORITY = 1500; // повышаем приоритет что бы система была важнее дефолтной(1000)

const containerEl = document.getElementById('container'), //тут всё отображение
      ResourceWindow = document.getElementById('resource-window'); //скрытый контейнер res

// hide quality assurance if user clicks outside
//скрываем форму редактирования обьекта при клике вне фрэйма
window.addEventListener('click', (event) => {
  const { target } = event;
  console.log(target)
  if (target === ResourceWindow || target === buttonShowResource || ResourceWindow.contains(target) || target.id == "addRes") {
    return;
  }
  ResourceWindow.classList.add('hidden');
});




// create modeler
const bpmnModeler = new BpmnModeler({
  container: containerEl,
  propertiesPanel: { // из примера с панелью св
    parent: '#properties'
  },
  additionalModules: [ // подгрузка модулей
    customModule,
    minimapModule,
    
    BpmnPropertiesPanelModule, // из примера с панелью св
    BpmnPropertiesProviderModule, // из примера с панелью св
    resourcePropertiesProvider,
    ltsmPropertiesProvider
    
  ],
  moddleExtensions: {
    qa: qaExtension, 
    ltsm: ltsmExtension // добавление расширения модели
  }
});


// import file button
const buttonImportXML = document.querySelector('.button_import');
const reader = new FileReader();
buttonImportXML.addEventListener('change', function(file_input) {
  if (file_input.target.files[0]) {
    var file = file_input.target.files[0];
    reader.readAsText(file);
    reader.addEventListener('load', (e) => {
      importXMLfromFile(reader.result);
    });
    reader.addEventListener('error', () => {
      console.error(`Произошла ошибка при чтении файла`);
    });
  }
})

// save file

buttonSaveXML.addEventListener('click', async function() {
  console.log("click!!");
  try {
    const { xml } = await bpmnModeler.saveXML();
    console.log(xml);
  } catch (err) {
    console.log(err);
  }
})



// import XML
importXMLfromFile(diagramXML); //предустановка
function importXMLfromFile(file){
  
bpmnModeler.importXML(file).then(() => {

  const moddle = bpmnModeler.get('moddle'),
        modeling = bpmnModeler.get('modeling');
  const RootElement = bpmnModeler._definitions.rootElements

  
  let businessObject,
      element;

  bpmnModeler.on('element.contextmenu', HIGH_PRIORITY, (event) => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    ({ element } = event);
    
    // ignore root element
    if (!element.parent) {
      return;
    }
    businessObject = getBusinessObject(element)

    console.log(element)
  });

  function UppdateResourceList(){
    ResourceList.innerHTML = ''
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource")
      {
        //console.log(element.name)
        let resource = document.createElement("div")
        resource.className = "resource"
        resource.id = element.id
        resource.innerHTML = element.name
        ResourceList.append(resource)
      }

    });
    let resource = document.createElement("div")
    resource.className = "resource"
    resource.id = "addRes"
    resource.innerHTML = "Добавить ресурс"
    ResourceList.append(resource)
  }
  
  buttonShowResource.addEventListener('click', async function() {
    //console.log(bpmnModeler._definitions.rootElements)
    UppdateResourceList()
    ResourceWindow.classList.remove('hidden');
  })

  ResourceList.addEventListener('click', (event) => {
    const { target } = event;

    if(target.id == "addRes")
    {
      const Res = moddle.create('bpmn:Resource')
      console.log(Res)
      Res.id = "RS_new"
      Res.name = "Новый"
      let resParams = []
      let resParam = moddle.create("bpmn:ResourceParameter")
      resParam.id = "RS_new_P_1"
      resParam.name = "name"
      resParams.push(resParam)

      resParam = moddle.create("bpmn:ResourceParameter")
      resParam.id = "RS_new_P_2"
      resParam.name = "threads"
      resParams.push(resParam)
      
      resParam = moddle.create("bpmn:ResourceParameter")
      resParam.id = "RS_new_P_3"
      resParam.name = "productivity"
      resParams.push(resParam)

      Res.resourceParameters = resParams

      console.log(Res)
      bpmnModeler._definitions.rootElements.push(Res)
      UppdateResourceList()
      return
    }
    if(target.className == "resource"){
      RootElement.forEach(element => {
        if(element.id == target.id)
        {
          console.log("Найден элемент", element)
          CreateResourceEditWindow(element)
          
        }
      });
    }
  });


  function CreateResourceEditWindow(element){
    ResourceEdit.innerHTML = ""
    let resourceedit = document.createElement("div")
    resourceedit.className = ""
    resourceedit.id = element.id


    let divL = document.createElement("div")
    let pL = document.createElement("p") 
    pL.innerHTML = "Ресурс: " + element.name
    divL.append(pL)
    pL = document.createElement("p") 
    pL.innerHTML = "id: " + element.id
    divL.append(pL)
    resourceedit.append(divL)


    divL = document.createElement("div")
    console.log("hhh")
    element.resourceParameters.forEach(param => {
      console.log(param)
      let param_div = document.createElement("div")
      let input_param = document.createElement("input")
      input_param.id = "id_param"
      input_param.value = param.id
      param_div.append(input_param)

      input_param = document.createElement("input")
      input_param.id = "name_param"
      input_param.value = param.name
      param_div.append(input_param)

      divL.append(param_div)
    });
    resourceedit.append(divL)
    ResourceEdit.append(resourceedit)
  }


  /*
  // close quality assurance if user presses escape
  formEl.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      qualityAssuranceEl.classList.add('hidden');
    }
  });*/

  bpmnModeler.get('minimap').open();

}).catch((err) => {
  console.error(err);
});
}
/*
function getExtensionElement(element, type) {
  if (!element.extensionElements) {
    return 0;
  }
  return element.extensionElements.values.filter((extensionElement) => {
    return extensionElement.$instanceOf(type);
  })[0];
}*/