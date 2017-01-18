/**
 * [created by isabolic sabolic.ivan@gmail.com]
 */


// namespace
(function(){
   if(window.apex.plugins === undefined){
      window.apex.plugins = {};
   }
}());

(function($, x) {
    var options = {
        $itemId          : null,
        config           : {  showOnlyIcons:false,
                              verticalAlignBtn:false,
                              data : []
                            },
        htmlTemplate     : {
            item :  '<div class="btn-group plg" data-toggle="buttons" id="cont-{{name}}">'                                                          +
                       '{{#each buttons}}'                                                                                                      +
                       '<label class="t-Button t-Button--hot" ot-title="{{text}}">'                                                                                 +
                           '{{#if icon}}'                                                                                                       +
                           '<i class="icon fa fa-fw {{icon}}"></i>'                                                                                    +
                           '{{/if}}'                                                                                                            +
                           '<input type="radio" name="{{name}}" value="{{value}}" autocomplete="off">{{text}}</input>'  +
                        '</label>'                                                                                                              +
                       '{{/each}}'                                                                                                              +
                    '</div>'
        }
    };

    var apexUniThemeButtonsCls = ["t-Button--primary", "t-Button--warning", "t-Button--success", "t-Button--danger"];

    /**
     * [setButtonClass - PRIVATE check if container has specific button class of apex universal theme and set them to button group]
     */
    var setButtonClass = function setButtonClass (){
       var fld = this.container.closest(".t-Form-fieldContainer");
        if (fld.length > 0 ) {
           $.each(apexUniThemeButtonsCls, function(idx, cls){
               if (fld.hasClass(cls)){

                   fld.removeClass(cls);
                   this.container
                       .find(".t-Button").addClass(cls);
               }
           }.bind(this));
        }
    };

    /**
     * [xDebug - PRIVATE function for debug]
     * @param  string   functionName  caller function
     * @param  array    params        caller arguments
     */
    var xDebug = function(functionName, params){
        x.debug(this.jsName || " - " || functionName, params, this);
    };

    /**
     * [triggerEvent     - PRIVATE handler fn - trigger apex events]
     * @param String evt - apex event name to trigger
     */
    var triggerEvent = function(evt, evtData) {
        xDebug.call(this, arguments.callee.name, arguments);
        this.options.$itemValId.trigger(evt, [evtData]);
        $(this).trigger(evt + "." + this.apexname, [evtData]);
    };

    /**
     * [toggleActiveBtn toggle active class and set apex item hidden value]
     * @param  {[type]} e [description]
     */
    var toggleActiveBtn = function(e){
        this.container
            .find(".t-Button")
            .removeClass("active");

        this.container
            .find(".t-Button input[type='radio']")
            .attr("checked", false);

        $(e.currentTarget).addClass("active");
        $(e.currentTarget).find("input[type='radio']")
                          .attr("checked", true);

        this.options
            .$itemId
            .val(
              $(e.currentTarget)
                 .find("input[type='radio']")
                 .val()
            );
    }
    /**
     * [setTooltip - PRIVATE set tooltip on button fix text is too long or option showOnlyIcons is true]
     */
    var setTooltip = function(){
      if (this.options.config.showOnlyIcons  === false){
          $.each(this.container
                     .find("label.t-Button")
                     ,function(idx, el){
                      if ($(el).data("opentips") === undefined){

                        if ( $(el).isEllipsisActive() ){

                          new Opentip(
                            $(el),
                            $(el).attr("ot-title"),
                            { style: "dark", delay:0.5 }
                          );

                        }

                      } else {
                          if ( $(el).isEllipsisActive() === false){
                              $(el).data("opentips")[0].deactivate();
                          }else{
                              $(el).data("opentips")[0].activate();
                          }
                      }
                     }.bind(this));
      } else {
          $.each(this.container
                     .find("label.t-Button")
                     ,function(idx, el){

                        if ($(el).data("opentips")  === undefined) {
                          new Opentip(
                            $(el),
                            $(el).attr("ot-title"),
                            {style: "dark", delay: 0.5}
                          )
                        }

                        // remove text
                        $(el).contents().filter(function(){
                          return this.nodeType === 3;
                        }).remove();

                     }.bind(this));
      }
    }
    /**
     * [setInitValue - PRIVATE set inital value (active button)]
     */
    var setInitValue = function(){
        var input,
            val = this.options.value;

        if (val){
            input = this.container
                        .find(".t-Button input[value='"+val+"']");

            input.closest(".t-Button").addClass("active");
            this.options.$itemId.val(val);
        }
    }

    /**
     * [stretchItem - PRIVATE stretch item to full width of column model]
     */
    var stretchItem = function (){
      var len,
          strechInputs = this.container
                             .closest(".t-Form-fieldContainer--stretchInputs")

      if (strechInputs.length > 0) {

          this.container.addClass("full-width");
          if (this.options.config.verticalAlignBtn === false ){
            len  = (100 /
                    this.container
                        .find("label.t-Button")
                        .length);

            $.each(this.container
                          .find("label.t-Button"), function(idx, el){
                            $(el).css({width:len +"%"});
                          }.bind(this));
          }
      }

      if (this.options.config.verticalAlignBtn === true){
          $.each(this.container
                     .find("label.t-Button")
                ,function(idx, el){
                  $(el).addClass("vertical-align");
                }.bind(this)
          )

          if (strechInputs.length === 0){
            this.container.addClass("fixed-width");
          }
      }
    }

    /**
     * [setLineHeight - PRIVATE set label line height]
     */
    var setLineHeight = function(){
      var  labelEl = $("label[for='"+ this.options.itemId + "']");

      if (this.options.config.verticalAlignBtn === false){
        lHeight = (this.container.closest(".t-Form-inputContainer").height() -
                      (labelEl.outerHeight(true) - labelEl.innerHeight()));

        labelEl.closest(".t-Form-labelContainer")
               .css({"line-height": lHeight + "px"})

        labelEl.closest(".t-Form-labelContainer")
               .addClass("btn-group-label");
      }
    }

    apex.plugins.buttonGroup = function(opts) {
        this.apexname = "BUTTON.GROUP";
        this.jsName = "apex.plugins.buttonGroup";
        this.container = null;
        this.options = {};
        this.events = [];
        this.tooltips = [];
        this.init = function() {
            var itemTemplate, len;

            xDebug.call(this, arguments.callee.name, arguments);

            if (window.Handlebars === undefined){
                throw this.jsName || ": requires handlebars.js (http://handlebarsjs.com/)";
            }

            if ($.isFunction(Opentip) === undefined){
              throw this.jsName || ": requires opentip (http://www.opentip.org/)";
            }

            if ($.isPlainObject(opts)) {
                this.options = $.extend(true, {}, this.options, options, opts);
            } else {
                throw this.jsName || ": Invalid options passed.";
            }

            this.options.config = $.parseJSON(this.options.config);

            this.options.$itemId = $("#" + this.options.itemId);

            if (this.options.$itemId === null) {
                throw this.jsName || ": itemId is required.";
            }

            itemTemplate =  Handlebars.compile(this.options.htmlTemplate.item);
            itemTemplate = itemTemplate({"buttons":this.options.config.data, "name": this.options.itemId});

            this.options.$itemId.after(itemTemplate);

            this.container = $("#cont-" + this.options.itemId);

            this.container
                .on("click", "label.t-Button", toggleActiveBtn.bind(this));

            stretchItem.call(this);

            setInitValue.call(this);

            setLineHeight.call(this);

            setButtonClass.call(this);

            setTooltip.call(this);

            $(window).resize(setTooltip.bind(this));

            return this;
        }

        return this.init();
    };

    apex.plugins.buttonGroup.prototype = {

    };


$.fn.isMobile = function() {
  try{ document.createEvent("TouchEvent"); return true; }
  catch(e){ return false; }
}

$.fn.isEllipsisActive = function(e) {
    return (this.get(0).offsetWidth < this.get(0).scrollWidth);
}

})(apex.jQuery, apex);
