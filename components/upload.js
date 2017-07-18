FW.components.Upload = function ( domr ) {
    "use strict";

    var Upload = Upload || {};

    function init(domr) {

        Upload = FW.components.Component(Upload, domr); 

        FW.registerComponent("upload", Upload);

        if (!Upload.getModule()) return;

        dropzone();

        return Upload;
    };

    Upload.setValue = function(fileUrl) {

      Upload.clean();
      Upload.domr.append(makeImgPreview(fileUrl));      
      Upload.domr.append(makeDeleteButton(fileUrl));

      return Upload;
    };

    Upload.setController = function (controller) {
      
      Upload._module = FW.getModule(controller);      
      if (Upload._module)      
        Upload.setAttr("fw-controller", Upload._controller = controller);
      
      Upload.clean();
      dropzone();
    };

    Upload.clean = function() {

      Upload.domr.find("img,button,p,span").remove();   

      for (var item in Dropzone.instances) {
        if (Dropzone.instances[item] && Dropzone.instances[item].hasOwnProperty("element") && Dropzone.instances[item].element === Upload.domr[0])
          Dropzone.instances[item].destroy();
      }

      return Upload;
    };

    function dropzone() {

      Upload.domr.addClass("dropzone");
      Upload.domr.css("height", "80px");
      Upload.domr.css("clear", "both");

      var dropzone = new Dropzone("div#" + Upload.domr.attr('id'), { 
        url: FW.config.url + "/" + Upload.getController() + "/upload",
        maxFiles: 1,
        dictDefaultMessage: "Arraste o arquivo para fazer upload.",
        dictFallbackMessage: "Seu browser não suporta esta funcionalidade.",
        params: $.extend({
          _token: FW.getToken(),
          name: Upload.domr.attr('name')
        }, FW.getParams(Upload.domr))
      });
      
      dropzone.on("success", function(file, xhr) {
        Upload.setValue(xhr.path);
      });
    }

    function makeImgPreview(path) {

      Upload.domr.find('div').remove();
      Upload.domr.removeAttr('class');
      Upload.domr.attr('class', '');
      Upload.domr.css("clear", "both");
      Upload.domr.css("height", "");

      var img = $(document.createElement('img'));
      img.attr("src", FW.config.url + "/" + path);
      img.addClass("img-responsive img-thumbnail");

      return img;
    }

    function makeDeleteButton(path) {

      var button = FW.components.ButtonFactory.make({
        color: "danger",
        icon: "trash",
        text: "Deletar",
        align: "left",
        size: "sm"
      });
      button.css("margin-top", "5px");
      button.attr("fw-param-file", path);

      button.on("click", function() {
        Upload.getModule().callbacks.destroyDone = function() {                       
          Upload.clean();
          FW.scan(Upload.domr.parent()); 
        };
        FW.helpers.Rest.destroyFile(Upload.getModule(), FW.getParams(button));
      });
      return button;
    };

    return init(domr);    
};