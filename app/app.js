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
const ResourceAddSV = document.getElementById("res_add_StrVol_Button");
const ResourceParamsDiv = document.getElementById("resource-params");


const HIGH_PRIORITY = 1500; // повышаем приоритет что бы система была важнее дефолтной(1000)

const containerEl = document.getElementById('container'), //тут всё отображение
      ResourceWindow = document.getElementById('resource-window'); //скрытый контейнер res

// hide quality assurance if user clicks outside
//скрываем форму редактирования обьекта при клике вне фрэйма
window.addEventListener('click', (event) => {
  const { target } = event;
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

// save file button
const saveWindow = document.getElementById('save-window');

// Обработчик клика по кнопке "Сохранить"
buttonSaveXML.addEventListener('click', async function() {
  try {
    const { xml } = await bpmnModeler.saveXML();
    console.log(xml);
    // Создаем Blob объект с типом text/xml
    const blob = new Blob([xml], { type: 'application/bpmn' });
    console.log(blob, "nen")
    // Создаем ссылку для скачивания файла
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    // Показываем модальное окно
    saveWindow.classList.add('show');

  } catch (err) {
    console.log(err);
  }
});
// Закрытие модального окна при клике на фон
saveWindow.addEventListener('click', function(event) {
  if (event.target === saveWindow) {
    saveWindow.classList.remove('show');
  }
});
// Закрытие модального окна при клике на кнопку внутри модального окна
document.getElementById('downloadLink').addEventListener('click', function() {
  saveWindow.classList.remove('show');
});


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

  function UppdateResourceList(){ //создание списка ресурсов
    console.log("ttt")
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

  function CreateResource(){
    const Res = moddle.create('bpmn:Resource') // создаём обьект ресурс
      Res.id = "RS_new" // стандартное id ресурса
      Res.name = "Новый" // стандартное имя ресурса
      let resParams = [] // массив параметров
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

      Res.resourceParameters = resParams // добавляем параметры
      console.log(Res, JSON.stringify(Res))
      bpmnModeler._definitions.rootElements.push(Res)
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
      CreateResource()
      UppdateResourceList()
      return
    }
    if(target.className == "resource"){
      RootElement.forEach(element => {
        if(element.id == target.id)
        {
          //console.log("Найден элемент", element)
          CreateResourceEditWindow(element)
          
        }
      });
    }
  });


  function CreateResourceEditWindow(element){
    document.getElementById("res_name").value = element.name
    document.getElementById("res_id").value = element.id
    let divclone = document.getElementById("resource-param-0").cloneNode(true)
    document.getElementById("resource-params").innerHTML = ""
    document.getElementById("jsonObj").innerHTML = JSON.stringify(element)
    console.log(element)
    element.resourceParameters.forEach(param => {
      let div = divclone.cloneNode(true)
      div.id = param.id
      div.children[0].children[0].innerHTML = param.id
      div.children[1].children[0].innerHTML = param.name
      div.children[2].children[0].value = param.value || ""

      document.getElementById("resource-params").append(div)
    });

    let stream = undefined
    let volume = undefined
    try {
      element.extensionElements.values.forEach(prop => { 
        if(prop.$type == "ltsm:props" && prop.hasOwnProperty("stream") && prop.hasOwnProperty("volume")){
          stream = prop.stream
          volume = prop.volume
        }
      })
    } catch (error) {
      //pu pu pu
    }
    if(stream != undefined && volume != undefined)
    {
      ResourceAddSV.style.display = "none"
      const propsDiv = document.getElementById("res-StrVol")
      propsDiv.style.display = "block"
      propsDiv.children[0].children[1].value = stream
      propsDiv.children[1].children[1].value = volume
    }
    else{
      ResourceAddSV.style.display = "block"
      document.getElementById("res-StrVol").style.display = "none"
    }
  }

  ResourceParamsDiv.addEventListener('change', async function(event) {
    let idres = document.getElementById("res_id").value
    let value = event.target.value
    let target_id = event.target.id
    let id_res_param = event.target.parentElement.parentElement.id
    console.log(idres, value, id_res_param, target_id, RootElement)
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        element.resourceParameters.forEach(element_param => {
          if(element_param.id == id_res_param)
            {
              if(target_id == "res-param-value")
                element_param.value = value
            }
        });
      }
    });
    console.log(RootElement)
  })


  //работа с stream и volume в окне ресурсов 
  ResourceAddSV.addEventListener('click', async function() {
    let idres = document.getElementById("res_id").value
    console.log(idres, RootElement)
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        if(!element.hasOwnProperty("extensionElements")){
          console.log("создан ExtensionElements")
          element.extensionElements = moddle.create("bpmn:ExtensionElements")// создаём ExtensionElements
          element.extensionElements.values = []
        }
        let LTSMprops = moddle.create("ltsm:props")
        LTSMprops.stream = 1
        LTSMprops.volume = 1
        element.extensionElements.values.push(LTSMprops)
      }
    });
  })

  const StreamInputResource = document.getElementById("streamRes")
  const VolumrInputResource = document.getElementById("volumeRes")
  StreamInputResource.addEventListener('change', async function(event) {
    let idres = await document.getElementById("res_id").value
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        console.log(element.extensionElements.values)
        element.extensionElements.values.forEach(props => {
          if(props.$type == "ltsm:props"){
            props.stream = Number(event.target.value)
          }
        })
      }
    });
  })

  VolumrInputResource.addEventListener('change', async function(event) {
    let idres = await document.getElementById("res_id").value
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        console.log(element.extensionElements.values)
        element.extensionElements.values.forEach(props => {
          if(props.$type == "ltsm:props"){
            props.volume = Number(event.target.value)
          }
        })
      }
    });
  })

  bpmnModeler.get('minimap').open();

}).catch((err) => {
  console.error(err);
});
}
